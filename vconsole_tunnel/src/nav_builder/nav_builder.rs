use std::collections::HashSet;
use rusqlite::Connection;
use tokio::sync::Mutex;
use crate::game::commands::DrawDebugSphere;
use crate::game::elizabeth::Elizabeth;
use crate::game::gadget::{GadgetProgram, GadgetTool};
use crate::game::player::{input_button, PlayerInput};
use crate::game::trace::{BoxTrace, LineTrace};
use crate::math::Vector3;
use crate::vtunnel::{VTunnelMessage, VTunnelMessageBatch, VTunnelSerializable};
use crate::vtunnel_emitter::VTunnelEmitter;

#[derive(Debug, Clone)]
pub enum NavType {
    Walkable,
    Obstacle,
}

impl NavType {
    pub fn to_int(&self) -> u8 {
        match self {
            NavType::Walkable => 0,
            NavType::Obstacle => 1,
        }
    }

    pub fn from_int(value: u8) -> Self {
        match value {
            0 => NavType::Walkable,
            1 => NavType::Obstacle,
            _ => NavType::Obstacle,
        }
    }
}

#[derive(Debug, Clone)]
pub struct NavPoint {
    pub id: u64,
    pub position: Vector3,
    pub nav_type: NavType,
}

impl NavPoint {
    fn to_add_vmsg(&self) -> VTunnelMessage {
        let mut vmsg = VTunnelMessage::new("add_nav_point".to_string());
        vmsg.add_int(self.id as i64);
        vmsg.add_vector3(self.position.clone());
        vmsg.add_int(self.nav_type.to_int() as i64);
        vmsg
    }

    /**
     * Returns a VTunnelMessage to draw the nav point.
     * Smaller than calling the debug draws directly.
     */
    fn to_draw_vmsg(&self) -> VTunnelMessage {
        let mut vmsg = VTunnelMessage::new("draw_nav_point".to_string());
        vmsg.add_int(self.id as i64);
        vmsg.add_vector3(self.position.clone());
        vmsg.add_int(self.nav_type.to_int() as i64);
        vmsg
    }
}

pub enum NavEditorMode {
    Add,
    Remove,
    Toggle,
}

impl NavEditorMode {
    pub fn to_int(&self) -> u8 {
        match self {
            NavEditorMode::Add => 0,
            NavEditorMode::Remove => 1,
            NavEditorMode::Toggle => 2,
        }
    }

    pub fn to_color(&self) -> Vector3 {
        match self {
            NavEditorMode::Add => Vector3::new(0.0, 255.0, 0.0),
            NavEditorMode::Remove => Vector3::new(255.0, 0.0, 0.0),
            NavEditorMode::Toggle => Vector3::new(0.0, 0.0, 255.0),
        }
    }
}

pub struct NavBuilderProgram {
    emitter: &'static VTunnelEmitter,
    db: Mutex<Connection>,
    nav_points: Vec<NavPoint>,
    nav_points_set: HashSet<Vector3>,
    active: bool,
    is_first_click: bool,
    nav_editor_mode: NavEditorMode,
}

impl NavBuilderProgram {
    const NAV_POINT_GRID_SIZE: f64 = 16.0; // 1 foot in Source units

    pub async fn new(emitter: &'static VTunnelEmitter) -> Self {
        let mut s = Self {
            emitter,
            db: Mutex::new(Connection::open("nav_builder.db").unwrap()),
            nav_points: Vec::new(),
            nav_points_set: HashSet::new(),
            active: false,
            is_first_click: true,
            nav_editor_mode: NavEditorMode::Add,
        };

        s.load_db().await;
        s
    }

    async fn load_db(&mut self) {
        let db = self.db.lock().await;
        db.execute(
            "CREATE TABLE IF NOT EXISTS nav_point (
            id    INTEGER PRIMARY KEY,
            position_x  REAL NOT NULL,
            position_y  REAL NOT NULL,
            position_z  REAL NOT NULL,
            nav_type    INTEGER NOT NULL
        )", ()).unwrap();

        let mut nav_point_query = db.prepare("SELECT id, position_x, position_Y, position_z, nav_type FROM nav_point").unwrap();
        let nav_point_iter = nav_point_query.query_map([], |row| {
            Ok(NavPoint {
                id: row.get(0)?,
                position: Vector3::new(row.get(1)?, row.get(2)?, row.get(3)?),
                nav_type: NavType::from_int(row.get(4)?),
            })
        }).unwrap();

        for nav_point in nav_point_iter {
            if let Ok(np) = nav_point {
                let mut unique_position = self.round_to_grid(&np.position);
                unique_position.z = unique_position.z.ceil();
                self.nav_points_set.insert(unique_position);
                self.nav_points.push(np);
            }
        }
    }

    fn get_nearest_nav_point(&self, position: &Vector3) -> Option<&NavPoint> {
        let mut nearest_nav_point = None;
        let mut nearest_distance = f64::MAX;

        for nav_point in &self.nav_points {
            let distance = nav_point.position.distance(&position);
            if distance < nearest_distance {
                nearest_distance = distance;
                nearest_nav_point = Some(nav_point);
            }
        }

        // Don't return nav points that are too far away.
        if nearest_distance > Self::NAV_POINT_GRID_SIZE {
            return None;
        }

        nearest_nav_point
    }

    async fn upload_nav_points(&self) {
        let mut vmsg_batch = VTunnelMessageBatch::new();
        vmsg_batch.set_batch_size(15);

        let clear_vmsg = VTunnelMessage::new("clear_nav_points".to_string());
        vmsg_batch.add_message(clear_vmsg);

        for nav_point in &self.nav_points {
            vmsg_batch.add_message(nav_point.to_add_vmsg());
        }

        self.emitter.send_batch(vmsg_batch).await;
    }

    async fn add_nav_point(&mut self, position: &Vector3, nav_type: NavType) -> Option<NavPoint> {
        let position = self.round_to_grid(position);

        let mut unique_position  = position.clone();
        unique_position.z = unique_position.z.ceil();
        if self.nav_points_set.contains(&unique_position) {
            return None;
        }

        let mut nav_point = NavPoint { id: 0, position, nav_type };
        let db = self.db.lock().await;
        db.execute(
            "INSERT INTO nav_point (position_x, position_y, position_z, nav_type) VALUES (?1, ?2, ?3, ?4)",
            (&nav_point.position.x, &nav_point.position.y, &nav_point.position.z, nav_point.nav_type.to_int()),
        ).unwrap();
        nav_point.id = db.last_insert_rowid() as u64;

        self.nav_points_set.insert(unique_position);
        self.nav_points.push(nav_point.clone());

        Some(nav_point)
    }

    async fn remove_nav_point(&mut self, nav_point_id: u64) -> Option<NavPoint> {
        let mut remove_index = None;
        for (index, nav_point) in self.nav_points.iter().enumerate() {
            if nav_point.id == nav_point_id {
                remove_index = Some(index);
                break;
            }
        }

        if remove_index.is_none() {
            return None;
        }

        let remove_index = remove_index.unwrap();
        let removed_nav_point = self.nav_points.remove(remove_index);

        let mut unique_position  = self.round_to_grid(&removed_nav_point.position);
        unique_position.z = unique_position.z.ceil();
        self.nav_points_set.remove(&unique_position);

        let db = self.db.lock().await;
        db.execute(
            "DELETE FROM nav_point WHERE id = ?1",
            [removed_nav_point.id],
        ).unwrap();

        Some(removed_nav_point)
    }

    fn round_to_grid(&self, position: &Vector3) -> Vector3 {
        Vector3::new(
            (position.x / Self::NAV_POINT_GRID_SIZE).round() * Self::NAV_POINT_GRID_SIZE,
            (position.y / Self::NAV_POINT_GRID_SIZE).round() * Self::NAV_POINT_GRID_SIZE,
            position.z,
        )
    }

    pub async fn emit_state(&self) {
        self.emitter.send::<NavBuilderProgram>(&self).await;
    }

    pub async fn cycle_mode(&mut self) {
        self.nav_editor_mode = match self.nav_editor_mode {
            NavEditorMode::Add => NavEditorMode::Remove,
            NavEditorMode::Remove => NavEditorMode::Toggle,
            NavEditorMode::Toggle => NavEditorMode::Add,
        };

        self.emit_state().await;
    }

    /**
     * Checks if the given position has space for a nav point.
     * Returns boolean if the position has space, and the position of the space if valid.
     */
    async fn position_has_space(&self, position: &Vector3) -> (bool, Option<Vector3>) {
        let position = self.round_to_grid(&position);

        let floor_trace = LineTrace::new(position.add(&Vector3::new(0.0, 0.0, 10.0)), position.sub(&Vector3::new(0.0, 0.0, 1000.0)));
        let floor_trace_result = floor_trace.run(self.emitter).await;
        if floor_trace_result.is_err() {
            return (false, None);
        }
        let floor_trace_result = floor_trace_result.unwrap();
        if !floor_trace_result.hit {
            return (false, None);
        }

        let space_trace = BoxTrace::new(
            floor_trace_result.hit_position.add(&Vector3::new(0.0, 0.0, Self::NAV_POINT_GRID_SIZE)),
            floor_trace_result.hit_position.add(&Vector3::new(0.0, 0.0, 66.0)),
            Elizabeth::MINS,
            Elizabeth::MAXS,
        );
        let space_trace_result = space_trace.run(self.emitter).await;
        if space_trace_result.is_err() {
            return (false, None);
        }
        let space_trace_result = space_trace_result.unwrap();

        let is_floor = floor_trace_result.hit && floor_trace_result.hit_normal.dot(&Vector3::UP_VECTOR) > 0.5;
        let has_space = !space_trace_result.hit;

        if is_floor && has_space {
            (true, Some(self.round_to_grid(&floor_trace_result.hit_position)))
        } else {
            (false, Some(self.round_to_grid(&floor_trace_result.hit_position)))
        }
    }

    const POINT_RENDER_LIMIT: usize = 100;
    async fn render_nearby_nav_points(&mut self, position: Vector3) {
        let mut vmsg_batch = VTunnelMessageBatch::new();
        vmsg_batch.set_batch_size(15);

        let mut render_count = 0;
        let _ = &self.nav_points.sort_by(|a, b| a.position.distance(&position).partial_cmp(&b.position.distance(&position)).unwrap());
        for nav_point in &self.nav_points {
            if nav_point.position.distance(&position) < 1000.0 {
                vmsg_batch.add_message(nav_point.to_draw_vmsg());
                render_count += 1;
            }

            if render_count >= Self::POINT_RENDER_LIMIT {
                break;
            }
        }

        self.emitter.send_batch(vmsg_batch).await;
    }

    async fn on_trigger_clicked(&mut self, input: &PlayerInput) {
        match self.nav_editor_mode {
            NavEditorMode::Add => {
                let (has_space, position) = self.position_has_space(&input.trace_position).await;
                if (position.is_none()) {
                    return;
                }

                let mut nav_point: Option<NavPoint> = None;
                if has_space {
                    nav_point = self.add_nav_point(&position.clone().unwrap(), NavType::Walkable).await;
                } else {
                    nav_point = self.add_nav_point(&position.clone().unwrap(), NavType::Obstacle).await;
                };

                if nav_point.is_none() {
                    return;
                }

                self.emitter.send_vmsg(nav_point.unwrap().to_draw_vmsg()).await;
            }
            NavEditorMode::Remove => {
                let nav_point = self.get_nearest_nav_point(&input.trace_position);
                if nav_point.is_none() {
                    return;
                }

                let removed_nav_point = self.remove_nav_point(nav_point.unwrap().id).await;
                if removed_nav_point.is_none() {
                    return;
                }

                let draw_sphere = DrawDebugSphere {
                    position: removed_nav_point.unwrap().position.clone(),
                    color: Vector3::new(255.0, 0.0, 0.0),
                    color_alpha: 1.0,
                    radius: 5.0,
                    z_test: true,
                    duration_seconds: 10.0,
                };

                self.emitter.send::<DrawDebugSphere>(&draw_sphere).await;
            }
            NavEditorMode::Toggle => {
                let mut move_to_vmsg = VTunnelMessage::new("liz_move_to".to_string());
                move_to_vmsg.add_vector3(input.trace_position.clone());
                self.emitter.send_vmsg(move_to_vmsg).await;
            }
        }
    }
}

impl GadgetProgram for NavBuilderProgram {
    async fn on_activate(&mut self) {
        self.active = true;
        self.is_first_click = true;
        self.emit_state().await;
        println!("NavBuilder activated!");
    }

    async fn on_deactivate(&mut self) {
        self.active = false;
        self.emit_state().await;
        println!("NavBuilder deactivated!");
    }

    async fn on_input(&mut self, input: &PlayerInput) {
        if !self.active {
            return;
        }

        if input.is_pressed(input_button::IN_USE_HAND1) {
            if self.is_first_click {
                self.is_first_click = false;
                self.emit_state().await;
            } else {
                self.on_trigger_clicked(input).await;
            }
        }

        if input.is_pressed(input_button::IN_PAD_DOWN_HAND1) {
            self.cycle_mode().await;
        }

        if input.is_pressed(input_button::IN_MENU_HAND1) {
            self.upload_nav_points().await;
            // self.render_nearby_nav_points(input.hand_position.clone()).await;
        }
    }
}

impl VTunnelSerializable for NavBuilderProgram {
    fn serialize(&self) -> VTunnelMessage {
        let mut vmsg = VTunnelMessage::new("gadget_state".to_string());
        vmsg.add_int(self.nav_editor_mode.to_int() as i64);

        if self.active && !self.is_first_click {
            vmsg.add_vector3(self.nav_editor_mode.to_color());
        } else {
            vmsg.add_vector3(Vector3::default());
        }

        vmsg
    }
}