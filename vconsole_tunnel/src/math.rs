use std::hash::{Hash, Hasher};

const VECTOR3_EPSILON: f64 = 1e-9;

#[derive(Debug, Default, Clone)]
pub struct Vector3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl PartialEq for Vector3 {
    fn eq(&self, other: &Self) -> bool {
        (self.x - other.x).abs() < VECTOR3_EPSILON &&
            (self.y - other.y).abs() < VECTOR3_EPSILON &&
            (self.z - other.z).abs() < VECTOR3_EPSILON
    }
}

impl Eq for Vector3 {}

impl Hash for Vector3 {
    fn hash<H: Hasher>(&self, state: &mut H) {
        let x_hash = (self.x / VECTOR3_EPSILON).round() as i64;
        let y_hash = (self.y / VECTOR3_EPSILON).round() as i64;
        let z_hash = (self.z / VECTOR3_EPSILON).round() as i64;

        x_hash.hash(state);
        y_hash.hash(state);
        z_hash.hash(state);
    }
}

impl Vector3 {
    pub const UP_VECTOR: Vector3 = Vector3 { x: 0.0, y: 0.0, z: 1.0 };

    pub fn new(x: f64, y: f64, z: f64) -> Vector3 {
        Vector3 { x, y, z }
    }

    pub fn dot(&self, other: &Vector3) -> f64 {
        self.x * other.x + self.y * other.y + self.z * other.z
    }

    pub fn add(&self, other: &Vector3) -> Vector3 {
        Vector3 {
            x: self.x + other.x,
            y: self.y + other.y,
            z: self.z + other.z,
        }
    }

    pub fn sub(&self, other: &Vector3) -> Vector3 {
        Vector3 {
            x: self.x - other.x,
            y: self.y - other.y,
            z: self.z - other.z,
        }
    }

    pub fn distance(&self, other: &Vector3) -> f64 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        let dz = self.z - other.z;
        (dx * dx + dy * dy + dz * dz).sqrt()
    }
}
