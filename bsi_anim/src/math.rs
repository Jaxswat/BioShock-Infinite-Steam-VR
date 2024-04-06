pub mod math {
    use std::f32::consts::PI;
    use std::ops::{Add, Mul, Sub, SubAssign};

    #[derive(Debug, Default, Clone)]
    pub struct Vector3 {
        pub x: f32,
        pub y: f32,
        pub z: f32,
    }

    impl Vector3 {
        pub fn invalid() -> Self {
            Vector3 { x: f32::NAN, y: f32::NAN, z: f32::NAN }
        }

        pub fn is_invalid(&self) -> bool {
            self.x.is_nan() && self.y.is_nan() && self.z.is_nan()
        }

        pub fn cross(&self, b: Vector3) -> Vector3 {
            Vector3 {
                x: self.y * b.z - self.z * b.y,
                y: self.z * b.x - self.x * b.z,
                z: self.x * b.y - self.y * b.x,
            }
        }

        pub fn dot(&self, b: &Vector3) -> f32 {
            self.x * b.x + self.y * b.y + self.z * b.z
        }
    }

    impl Add<Vector3> for Vector3 {
        type Output = Vector3;

        fn add(self, b: Vector3) -> Vector3 {
            Vector3 {
                x: self.x + b.x,
                y: self.y + b.y,
                z: self.z + b.z,
            }
        }
    }

    impl Sub<&Vector3> for Vector3 {
        type Output = Vector3;

        fn sub(self, b: &Vector3) -> Vector3 {
            Vector3 {
                x: self.x - b.x,
                y: self.y - b.y,
                z: self.z - b.z,
            }
        }
    }

    impl SubAssign<&Vector3> for Vector3 {
        fn sub_assign(&mut self, b: &Vector3){
            self.x -= b.x;
            self.y -= b.y;
            self.z -= b.z;
        }
    }

    impl Mul<&Vector3> for Vector3 {
        type Output = Vector3;

        fn mul(self, b: &Vector3) -> Vector3 {
            Vector3 {
                x: self.x * b.x,
                y: self.y * b.y,
                z: self.z * b.z,
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
        pub fn invalid() -> Self {
            Quat4 { x: f32::NAN, y: f32::NAN, z: f32::NAN, w: f32::NAN }
        }

        pub fn is_invalid(&self) -> bool {
            self.x.is_nan() && self.y.is_nan() && self.z.is_nan() && self.w.is_nan()
        }

        pub fn xyz(&self) -> Vector3 {
            Vector3 {
                x: self.x,
                y: self.y,
                z: self.z,
            }
        }

        pub fn to_euler_angles(&self) -> Vector3 {
            let (sinr_cosp, cosr_cosp) = (2.0 * (self.w * self.x + self.y * self.z),
                                          1.0 - 2.0 * (self.x * self.x + self.y * self.y));
            let roll = sinr_cosp.atan2(cosr_cosp);

            let sinp = 2.0 * (self.w * self.y - self.z * self.x);
            let pitch = if sinp.abs() >= 1.0 {
                (PI / 2.0).copysign(sinp)
            } else {
                sinp.asin()
            };

            let (siny_cosp, cosy_cosp) = (2.0 * (self.w * self.z + self.x * self.y),
                                          1.0 - 2.0 * (self.y * self.y + self.z * self.z));
            let yaw = siny_cosp.atan2(cosy_cosp);

            Vector3 {
                x: pitch,
                y: yaw,
                z: roll,
            }
        }
    }

    impl Mul<&Quat4> for Quat4 {
        type Output = Quat4;

        fn mul(self, b: &Quat4) -> Quat4 {
            let cross = self.xyz().cross(b.xyz());
            Quat4 {
                w: self.w * b.w - self.xyz().dot(&b.xyz()),
                x: b.w * b.x + self.w * b.x + cross.x,
                y: b.w * b.y + self.w * b.y + cross.y,
                z: b.w * b.z + self.w * b.z + cross.z,
            }
        }
    }
}
