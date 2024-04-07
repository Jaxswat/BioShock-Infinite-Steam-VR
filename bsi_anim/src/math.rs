pub mod math {
    use std::ops::{Add, Mul, Sub, SubAssign};

    #[derive(Debug, Default, Clone)]
    pub struct Vector3 {
        pub x: f64,
        pub y: f64,
        pub z: f64,
    }

    impl Vector3 {
        pub fn cross(&self, b: &Vector3) -> Vector3 {
            Vector3 {
                x: self.y * b.z - self.z * b.y,
                y: self.z * b.x - self.x * b.z,
                z: self.x * b.y - self.y * b.x,
            }
        }

        pub fn dot(&self, b: &Vector3) -> f64 {
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
        fn sub_assign(&mut self, b: &Vector3) {
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
        pub w: f64,
        pub x: f64,
        pub y: f64,
        pub z: f64,
    }

    impl Quat4 {
        pub fn xyz(&self) -> Vector3 {
            Vector3 {
                x: self.x,
                y: self.y,
                z: self.z,
            }
        }

        pub fn to_euler_angles(&self) -> Vector3 {
            eul_from_quat(self)
        }
    }

    impl Mul<&Quat4> for Quat4 {
        type Output = Quat4;

        fn mul(self, b: &Quat4) -> Quat4 {
            let cross = self.xyz().cross(&b.xyz());
            Quat4 {
                w: self.w * b.w - self.xyz().dot(&b.xyz()),
                x: b.w * self.x + self.w * b.x + cross.x,
                y: b.w * self.y + self.w * b.y + cross.y,
                z: b.w * self.z + self.w * b.z + cross.z,
            }
        }
    }

    fn eul_from_quat(q: &Quat4) -> Vector3 {
        let mut m = [[0.0; 4]; 4];

        let x2 = q.x + q.x;
        let y2 = q.y + q.y;
        let z2 = q.z + q.z;
        let xx = q.x * x2;
        let xy = q.x * y2;
        let xz = q.x * z2;
        let yy = q.y * y2;
        let yz = q.y * z2;
        let zz = q.z * z2;
        let wx = q.w * x2;
        let wy = q.w * y2;
        let wz = q.w * z2;

        m[0][0] = 1.0 - (yy + zz);
        m[0][1] = xy - wz;
        m[0][2] = xz + wy;

        m[1][0] = xy + wz;
        m[1][1] = 1.0 - (xx + zz);
        m[1][2] = yz - wx;

        m[2][0] = xz - wy;
        m[2][1] = yz + wx;
        m[2][2] = 1.0 - (xx + yy);

        m[3][3] = 1.0;


        eul_from_mat(m)
    }

    fn eul_from_mat(m: [[f64; 4]; 4]) -> Vector3 {
        let mut angle = Vector3::default();

        let sy = (m[0][0] * m[0][0] + m[1][0] * m[1][0]).sqrt();

        if sy > 1.6e-4 {
            angle.x = m[2][1].atan2(m[2][2]);
            angle.y = (0.0 - m[2][0]).atan2(sy);
            angle.z = m[1][0].atan2(m[0][0]);
        } else {
            angle.x = (0.0 - m[1][2]).atan2(m[1][1]);
            angle.y = (0.0 - m[2][0]).atan2(sy);
            angle.z = 0.0;
        }

        angle
    }
}
