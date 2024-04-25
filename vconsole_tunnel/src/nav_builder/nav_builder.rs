use std::collections::HashSet;
use crate::game::commands::DrawDebugSphere;
use crate::game::elizabeth::Elizabeth;
use crate::game::gadget::{GadgetProgram, GadgetTool};
use crate::game::player::{input_button, PlayerInput};
use crate::game::trace::{BoxTrace, LineTrace};
use crate::math::Vector3;
use crate::vtunnel::{VTunnelMessage, VTunnelMessageBatch, VTunnelSerializable};
use crate::vtunnel_emitter::VTunnelEmitter;

pub enum NavType {
    Walkable,
    Obstacle,
}

pub struct NavPoint {
    pub position: Vector3,
    pub nav_type: NavType,
}

pub enum NavEditorMode {
    Add,
    Remove,
    Toggle,
}

impl NavEditorMode {
    pub fn to_int(&self) -> i64 {
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
    nav_points: Vec<NavPoint>,
    nav_points_set: HashSet<Vector3>,
    active: bool,
    is_first_click: bool,
    nav_editor_mode: NavEditorMode,
}

impl NavBuilderProgram {
    const NAV_POINT_GRID_SIZE: f64 = 16.0; // 1 foot in Source units

    pub fn new(emitter: &'static VTunnelEmitter) -> Self {
        Self {
            emitter,
            nav_points: Vec::new(),
            nav_points_set: HashSet::new(),
            active: false,
            is_first_click: true,
            nav_editor_mode: NavEditorMode::Add,
        }
    }

    fn add_nav_point(&mut self, position: &Vector3, nav_type: NavType) {
        let position = self.round_to_grid(position);

        if self.nav_points_set.contains(&position) {
            return;
        }

        self.nav_points_set.insert(position.clone());
        self.nav_points.push(NavPoint { position, nav_type });
    }

    fn round_to_grid(&self, position: &Vector3) -> Vector3 {
        Vector3::new(
            (position.x / Self::NAV_POINT_GRID_SIZE).round() * Self::NAV_POINT_GRID_SIZE,
            (position.y / Self::NAV_POINT_GRID_SIZE).round() * Self::NAV_POINT_GRID_SIZE,
            position.z.ceil(),
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
            floor_trace_result.hit_position.add(&Vector3::new(0.0, 0.0, 10.0)),
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

        let mut render_count = 0;
        let _ = &self.nav_points.sort_by(|a, b| a.position.distance(&position).partial_cmp(&b.position.distance(&position)).unwrap());
        for nav_point in &self.nav_points {
            if nav_point.position.distance(&position) < 1000.0 {
                let color = match nav_point.nav_type {
                    NavType::Walkable => Vector3::new(0.0, 255.0, 0.0),
                    NavType::Obstacle => Vector3::new(255.0, 0.0, 0.0),
                };

                let draw_sphere = DrawDebugSphere {
                    position: nav_point.position.clone(),
                    color: color.clone(),
                    color_alpha: 1.0,
                    radius: 5.0,
                    z_test: false,
                    duration_seconds: 5.0,
                };

                vmsg_batch.add_message(draw_sphere.serialize());
                render_count += 1;
            }

            if render_count >= Self::POINT_RENDER_LIMIT {
                break;
            }
        }

        self.emitter.send_batch(vmsg_batch).await;
    }

    async fn on_trigger_clicked(&mut self, input: &PlayerInput) {
        if !self.active {
            return;
        }

        match self.nav_editor_mode {
            NavEditorMode::Add => {
                let (has_space, position) = self.position_has_space(&input.trace_position).await;
                if (position.is_none()) {
                    return;
                }

                let color = if has_space {
                    self.add_nav_point(&position.clone().unwrap(), NavType::Walkable);
                    Vector3::new(0.0, 255.0, 0.0)
                } else {
                    self.add_nav_point(&position.clone().unwrap(), NavType::Obstacle);
                    Vector3::new(255.0, 0.0, 0.0)
                };

                let draw_sphere = DrawDebugSphere {
                    position: position.unwrap(),
                    color: color.clone(),
                    color_alpha: 1.0,
                    radius: 5.0,
                    z_test: false,
                    duration_seconds: 5.0,
                };

                self.emitter.send::<DrawDebugSphere>(&draw_sphere).await;
            }
            NavEditorMode::Remove => {
                let position = self.round_to_grid(&input.trace_position);
                let mut remove_index = None;
                for (index, nav_point) in self.nav_points.iter().enumerate() {
                    if nav_point.position.distance(&position) < 5.0 {
                        remove_index = Some(index);
                        break;
                    }
                }

                if remove_index.is_none() {
                    return;
                }

                let remove_index = remove_index.unwrap();
                let removed_nav_point = self.nav_points.remove(remove_index);
                self.nav_points_set.remove(&removed_nav_point.position);

                let draw_sphere = DrawDebugSphere {
                    position: removed_nav_point.position.clone(),
                    color: Vector3::new(255.0, 0.0, 0.0),
                    color_alpha: 1.0,
                    radius: 5.0,
                    z_test: true,
                    duration_seconds: 5.0,
                };

                self.emitter.send::<DrawDebugSphere>(&draw_sphere).await;
            }
            NavEditorMode::Toggle => {
                let draw_initial_sphere = DrawDebugSphere {
                    position: input.trace_position.clone(),
                    color: Vector3::new(0.0, 0.0, 255.0),
                    color_alpha: 1.0,
                    radius: 5.0,
                    z_test: false,
                    duration_seconds: 1.4,
                };
                self.emitter.send::<DrawDebugSphere>(&draw_initial_sphere).await;
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
            } else {
                self.on_trigger_clicked(input).await;
            }
        }

        if input.is_pressed(input_button::IN_PAD_DOWN_HAND1) {
            self.cycle_mode().await;
        }

        if input.is_pressed(input_button::IN_MENU_HAND1) {
            self.render_nearby_nav_points(input.hand_position.clone()).await;
        }
    }
}

impl VTunnelSerializable for NavBuilderProgram {
    fn serialize(&self) -> VTunnelMessage {
        let mut vmsg = VTunnelMessage::new("gadget_state".to_string());
        vmsg.add_int(self.nav_editor_mode.to_int());

        if self.active {
            vmsg.add_vector3(self.nav_editor_mode.to_color());
        } else {
            vmsg.add_vector3(Vector3::default());
        }

        vmsg
    }
}