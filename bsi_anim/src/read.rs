pub mod read {
    use std::io;
    use std::io::{Read, Seek};

    pub fn read_u8<R: Read + Seek>(reader: &mut R) -> io::Result<u8> {
        let mut buf = [0; 1];
        reader.read_exact(&mut buf)?;

        let value = buf[0];
        Ok(value)
    }

    pub fn read_i32<R: Read + Seek>(reader: &mut R) -> io::Result<i32> {
        let mut buf = [0; 4];
        reader.read_exact(&mut buf)?;

        let value = i32::from_le_bytes(buf);
        Ok(value)
    }

    pub fn read_i16<R: Read + Seek>(reader: &mut R) -> io::Result<i16> {
        let mut buf = [0; 2];
        reader.read_exact(&mut buf)?;

        let value = i16::from_le_bytes(buf);
        Ok(value)
    }

    pub fn read_u16<R: Read + Seek>(reader: &mut R) -> io::Result<u16> {
        let mut buf = [0; 2];
        reader.read_exact(&mut buf)?;

        let value = u16::from_le_bytes(buf);
        Ok(value)
    }

    pub fn read_f32<R: Read + Seek>(reader: &mut R) -> io::Result<f32> {
        let mut buf = [0; 4];
        reader.read_exact(&mut buf)?;

        let value = f32::from_le_bytes(buf);
        Ok(value)
    }
}
