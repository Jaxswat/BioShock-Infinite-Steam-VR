pub mod math {
    use std::f32::consts::PI;

    #[derive(Debug, Default, Clone)]
    pub struct Vector3 {
        pub x: f32,
        pub y: f32,
        pub z: f32,
    }

    impl Vector3 {
        pub fn sub(&self, b: Vector3) -> Vector3 {
            Vector3 {
                x: self.x - b.x,
                y: self.y - b.y,
                z: self.z - b.z,
            }
        }
    }


    #[derive(Debug, Default, Clone)]
    pub struct Quat4 {
        pub w: f32,
        pub x: f32,
        pub y: f32,
        pub z: f32,
    }

    impl Quat4 {
        pub fn to_euler_angles(&self) -> Vector3 {
            let sinr_cosp = 2.0 * (self.w * self.x + self.y * self.z);
            let cosr_cosp = 1.0 - 2.0 * (self.x * self.x + self.y * self.y);
            let roll = sinr_cosp.atan2(cosr_cosp);

            let sinp = 2.0 * (self.w * self.y - self.z * self.x);
            let pitch = if sinp.abs() >= 1.0 {
                (PI / 2.0) * sinp.signum()
            } else {
                sinp.asin()
            };

            let siny_cosp = 2.0 * (self.w * self.z + self.x * self.y);
            let cosy_cosp = 1.0 - 2.0 * (self.y * self.y + self.z * self.z);
            let yaw = siny_cosp.atan2(cosy_cosp);

            Vector3 {
                x: roll,
                y: pitch,
                z: yaw,
            }
        }
    }
}
