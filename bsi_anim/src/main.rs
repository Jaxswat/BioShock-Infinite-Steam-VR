mod math;
mod read;

use std::fmt::Write;
use std::fs::File;
use std::io::{BufReader, Read, Seek, SeekFrom};
use std::process::exit;
use read::read::read_u8;
use crate::math::math::{Quat4, Vector3};
use crate::read::read::{read_f32, read_i16, read_i32};

/**
 * This is a work in progress decompiling the mysterious bsi_anim.exe
 * This program will convert Morpheme animation files to SMD format
 */

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let file = File::open("debug.data").unwrap_or_else(|err| {
        eprintln!("Failed to read file: {}", err);
        exit(1);
    });
    let mut reader = BufReader::new(file);

    loop {
        let mut n = 0;
        while read_u8(&mut reader)? == 0 {
            n += 1;
        }

        if n >= 25 {
            break;
        }

        while read_u8(&mut reader)? != 0 {}
    }

    reader.seek(SeekFrom::Current(7))?; // Skip

    let num2 = read_i32(&mut reader)?; // Some kind of format?
    let anim_format = read_i32(&mut reader)?;
    if anim_format != num2 {
        eprintln!("unknown format: {} expected: {}", anim_format, num2);
        exit(1);
    }

    reader.seek(SeekFrom::Current(4))?; // Skip
    let position = reader.seek(SeekFrom::Current(0))? as i32;
    let _num3 = position + num2;

    let num4 = read_i32(&mut reader)?;
    if num4 != 3 {
        eprintln!("unsupported animation type: {}", num4);
        exit(1);
    }

    reader.seek(SeekFrom::Current(20))?; // Skip
    let anim_length_seconds = read_f32(&mut reader)?; // num5
    let anim_fps = read_f32(&mut reader)?; // num6
    println!("{} sec {} fps", anim_length_seconds, anim_fps);

    reader.seek(SeekFrom::Current(12))?; // Skip
    let num7 = read_i32(&mut reader)? - 48;
    reader.seek(SeekFrom::Current(num7 as i64))?; // Skip relative

    let mut stream = String::new();
    stream.write_str("version 1\n")?;
    stream.write_str("nodes\n")?;

    let file2 = File::open("debug.data2").unwrap_or_else(|err| {
        eprintln!("animset not found, failed to open file2: {}", err);
        exit(1);
    });
    let mut reader2 = BufReader::new(file2);

    let mut num8;
    loop {
        num8 = read_i32(&mut reader2)?;
        if num8 != -1 {
            reader2.seek(SeekFrom::Current(-3))?; // Go back
        } else {
            break;
        }
    }
    reader2.seek(SeekFrom::Current(-32))?; // Go back

    let offset = read_i32(&mut reader2)? as u64 + reader2.seek(SeekFrom::Current(0))? - 32;
    let num9 = read_i32(&mut reader2)? as u64 + reader2.seek(SeekFrom::Current(0))? - 36;
    reader2.seek(SeekFrom::Current(12))?; // Skip
    let num10 = read_i32(&mut reader2)? as usize;
    reader2.seek(SeekFrom::Current(4))?;

    let mut array: Vec<i32> = vec![0; num10 as usize];
    for i in 0..num10 as usize {
        array[i] = read_i32(&mut reader2)?;
    }

    let mut array2: Vec<String> = vec![String::new(); num10];
    reader2.seek(SeekFrom::Start(offset))?; // Seek from mysterious offset
    let mysterious_offset = read_i32(&mut reader2)? - 20;
    reader2.seek(SeekFrom::Current(mysterious_offset as i64))?; // Skip mysterious offset
    for i in 0..num10 {
        let mut str_len = 0;
        while read_u8(&mut reader2)? != 0 {
            str_len += 1;
        }

        reader2.seek(SeekFrom::Current(-(str_len + 1)))?; // Go to start of string
        let mut buf: Vec<u8> = vec![0; str_len as usize];
        reader2.read_exact(&mut buf)?;
        let str = String::from_utf8(buf)?;
        array2[i] = str.clone();
        let mut stream_line = String::new();
        write!(&mut stream_line, "{} \"{}\" {}\n", i, str, array[i])?;
        stream.write_str(&stream_line)?;
        reader2.seek(SeekFrom::Current(1))?; // Skip NUL
    }

    stream.write_str("end\n")?;
    stream.write_str("skeleton\n")?;

    reader2.seek(SeekFrom::Start(num9 + 20))?; // Go to mysterious offset
    let space_data_start = (read_i32(&mut reader2)? as u64) + reader2.seek(SeekFrom::Current(0))? - 24;
    reader2.seek(SeekFrom::Start(space_data_start))?; // Go to mysterious offset

    let offset2 = read_i32(&mut reader2)? as u64 + num9;
    let offset3 = read_i32(&mut reader2)? as u64 + num9;
    reader2.seek(SeekFrom::Start(offset3))?; // Go to mysterious offset

    let mut array3: Vec<Quat4> = vec![Quat4::default(); num10];
    // real, i, j, k: float32
    for i in 0..num10 {
        array3[i].x = read_f32(&mut reader2)?;
        array3[i].y = read_f32(&mut reader2)?;
        array3[i].z = read_f32(&mut reader2)?;
        array3[i].w = read_f32(&mut reader2)?;
    }

    reader2.seek(SeekFrom::Start(offset2))?; // Go to mysterious offset
    stream.write_str("time 0\n")?;
    let mut vector_3d;
    for i in 0..num10 {
        vector_3d = array3[i].to_euler_angles();
        let x = read_f32(&mut reader2)? * 50f32;
        let y = read_f32(&mut reader2)? * 50f32;
        let z = read_f32(&mut reader2)? * 50f32;
        stream.write_str(&i.to_string())?;
        stream.write_str(&format!("  {:.6}", x))?;
        stream.write_str(&format!(" {:.6}", y))?;
        stream.write_str(&format!(" {:.6}", z))?;
        reader2.seek(SeekFrom::Current(4))?; // Skip
        stream.write_str(&format!("  {:.6}", vector_3d.x))?;
        stream.write_str(&format!(" {:.6}", vector_3d.y))?;
        stream.write_str(&format!(" {:.6}", vector_3d.z))?;
    }
    // Close file2

    // Back to main reader
    let _i = read_f32(&mut reader)?;
    let _j = read_f32(&mut reader)?;
    let _k = read_f32(&mut reader)?;
    let _real = read_f32(&mut reader)?;
    // new Quat4 (doesn't get assigned?)

    let num11 = 60;
    reader.seek(SeekFrom::Current(16))?; // Skip
    let num12 = read_i16(&mut reader)?;
    let num13 = read_i16(&mut reader)?;
    let num14 = read_i16(&mut reader)?;
    let vector_3d2 = Vector3 {
        x: read_f32(&mut reader)?,
        y: read_f32(&mut reader)?,
        z: read_f32(&mut reader)?,
    };
    let mut vector_3d3 = Vector3 {
        x: read_f32(&mut reader)?,
        y: read_f32(&mut reader)?,
        z: read_f32(&mut reader)?,
    };
    vector_3d3 = vector_3d3.sub(vector_3d2);

    let vector_3d4 = Vector3 {
        x: read_f32(&mut reader)?,
        y: read_f32(&mut reader)?,
        z: read_f32(&mut reader)?,
    };
    let mut vector_3d5 = Vector3 {
        x: read_f32(&mut reader)?,
        y: read_f32(&mut reader)?,
        z: read_f32(&mut reader)?,
    };
    vector_3d5 = vector_3d5.sub(vector_3d4);

    reader.seek(SeekFrom::Current(8))?; // Skip
    let num15 = read_i16(&mut reader)?;
    let num16 = read_i16(&mut reader)?;
    let num17 = read_i16(&mut reader)?;
    let num18 = read_i16(&mut reader)?;
    if num18 > 0 {
        eprintln!("indexed rotations not supported!");
        exit(1);
    }

    let mysterious_const: usize = 0xFFFFFFFC; // Uhh...what?

    reader.seek(SeekFrom::Current(8))?; // Skip
    let _position2 = reader.seek(SeekFrom::Current(0))? as usize;
    let mut num19 = (num13 as usize * 6 + 3) & mysterious_const; // probably skipping some xyz floats?
    num19 += (num14 as usize * 6 + 3) & mysterious_const;
    reader.seek(SeekFrom::Current(num19 as i64))?; // Skip incredibly mysterious offset

    let mut array4: Vec<i32> = vec![0; num13 as usize];
    for i in 0..num13 as usize {
        array4[i] = read_i16(&mut reader)? as i32;
    }
    let mut array6: Vec<i32> = vec![0; num15 as usize];
    for i in 0..num15 as usize {
        array6[i] = read_i16(&mut reader)? as i32;
    }
    let mut array8: Vec<i32> = vec![0; num17 as usize];
    for i in 0..num17 as usize {
        array8[i] = read_i16(&mut reader)? as i32;
    }

    let mysterious_offset = (reader.seek(SeekFrom::Current(0))? - (position as u64) + 3) & (mysterious_const as u64);
    reader.seek(SeekFrom::Start(mysterious_offset))?; // Go to some mysterious offset
    let mut array5: Vec<i32> = vec![0; num14 as usize];
    for i in 0..num14 as usize {
        array5[i] = read_i16(&mut reader)? as i32;
    }

    let mut array7: Vec<i32> = vec![0; num16 as usize];
    let mut array10: Vec<bool> = vec![false; num12 as usize];
    for i in 0..num16 as usize {
        let value = read_i16(&mut reader)? as i32;
        array7[i] = value;
        array10[value as usize] = true;
    }
    let mut array9: Vec<i32> = vec![0; num18 as usize];
    for i in 0..num18 as usize {
        array9[i] = read_i16(&mut reader)? as i32;
    }
    array10[0] = true;

    // TODO: Line 210

    println!("{}", stream);
    Ok(())
}
