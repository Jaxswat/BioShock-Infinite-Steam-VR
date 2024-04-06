mod math;
mod read;

use std::{env, io};
use std::fmt::Write;
use std::fs::File;
use std::io::{BufReader, Read, Seek, SeekFrom};
use std::process::exit;
use read::read::read_u8;
use crate::math::math::{Quat4, Vector3};
use crate::read::read::{read_f32, read_i16, read_i32, read_u16};

/**
 * This is a work in progress decompiling the mysterious bsi_anim.exe
 * This program will convert Morpheme animation files to SMD format
 *
 * It builds and runs 10x faster than the original, but the output is not yet correct.
 * I'm still getting the occasional NaN for the Vector values which causes some keyframes to be skipped
 */

const WHAT: usize = 0xFFFFFFFC; // Uhh...what?
const VEC_SCALE: f32 = 50.0;

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
    let num3 = position + num2;

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

    let mut i;
    loop {
        i = read_i32(&mut reader2)?;
        if i != -1 {
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

    let mut array3: Vec<Quat4> = vec![Quat4::invalid(); num10];
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
        let x = read_f32(&mut reader2)? * VEC_SCALE;
        let y = read_f32(&mut reader2)? * VEC_SCALE;
        let z = read_f32(&mut reader2)? * VEC_SCALE;
        reader2.seek(SeekFrom::Current(4))?; // Skip

        stream.write_str(&i.to_string())?;
        stream.write_str(&format!("  {:.6}", x))?;
        stream.write_str(&format!(" {:.6}", y))?;
        stream.write_str(&format!(" {:.6}", z))?;
        stream.write_str(&format!("  {:.6}", vector_3d.x))?;
        stream.write_str(&format!(" {:.6}", vector_3d.y))?;
        stream.write_str(&format!(" {:.6}\n", vector_3d.z))?;
    }
    // Close file2

    // Back to main reader
    let _i = read_f32(&mut reader)?;
    let _j = read_f32(&mut reader)?;
    let _k = read_f32(&mut reader)?;
    let _real = read_f32(&mut reader)?;
    // new Quat4 (doesn't get assigned?)

    let num11 = 60;
    reader.seek(SeekFrom::Current(2))?; // Skip
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
    vector_3d3 -= &vector_3d2;

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
    vector_3d5 -= &vector_3d4;

    reader.seek(SeekFrom::Current(8))?; // Skip
    let num15 = read_i16(&mut reader)?;
    let num16 = read_i16(&mut reader)?;
    let num17 = read_i16(&mut reader)?;
    let num18 = read_i16(&mut reader)?;
    if num18 > 0 {
        eprintln!("indexed rotations not supported!");
        exit(1);
    }

    reader.seek(SeekFrom::Current(8))?; // Skip
    let position2 = reader.seek(SeekFrom::Current(0))?;
    let mut num19 = (num13 as usize * 6 + 3) & WHAT; // probably skipping some xyz floats?
    num19 += (num14 as usize * 6 + 3) & WHAT;
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

    let _ = return_to_mysterious_start(&mut reader, position);  // Go to some mysterious offset?
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

    let mut array11: Vec<Vec<Vector3>> = Vec::with_capacity(num11);
    for _ in 0..num11 {
        let mut inner_vec: Vec<Vector3> = Vec::with_capacity(num12 as usize);
        for _ in 0..num12 {
            inner_vec.push(Vector3::invalid());
        }
        array11.push(inner_vec);
    }
    let mut array12: Vec<Vec<Quat4>> = Vec::with_capacity(num11);
    for _ in 0..num11 {
        let mut inner_vec: Vec<Quat4> = Vec::with_capacity(num12 as usize);
        for _ in 0..num12 {
            inner_vec.push(Quat4::invalid());
        }
        array12.push(inner_vec);
    }

    reader.seek(SeekFrom::Start(position2))?; // Go to some mysterious offset
    let some_scale_constant = 65536f32;
    for i in 0..num13 as usize {
        array11[0][array4[i] as usize].x = ((read_u16(&mut reader)? as f32 / some_scale_constant) * vector_3d3.x) + vector_3d2.x;
        array11[0][array4[i] as usize].y = ((read_u16(&mut reader)? as f32 / some_scale_constant) * vector_3d3.y) + vector_3d2.y;
        array11[0][array4[i] as usize].z = ((read_u16(&mut reader)? as f32 / some_scale_constant) * vector_3d3.z) + vector_3d2.z;
    }

    let some_mysterious_offset = ((reader.seek(SeekFrom::Current(0))? - (position as u64) + 3) & (WHAT as u64)) + position as u64;
    reader.seek(SeekFrom::Start(some_mysterious_offset))?; // Go to some mysterious offset
    let some_scale_constant = 65536f32;
    for i in 0..num14 as usize {
        let x = ((read_u16(&mut reader)? as f32 / some_scale_constant) * vector_3d5.x) + vector_3d4.x;
        let y = ((read_u16(&mut reader)? as f32 / some_scale_constant) * vector_3d5.y) + vector_3d4.y;
        let z = ((read_u16(&mut reader)? as f32 / some_scale_constant) * vector_3d5.z) + vector_3d4.z;
        let mut num20 = x * x + y * y + z * z; // Squared length?
        let w = (1.0 - num20) / 2.0;
        num20 = 2.0 / (1.0 + num20); // some kind of inverse?

        array12[0][array5[i] as usize].x = x * num20;
        array12[0][array5[i] as usize].y = y * num20;
        array12[0][array5[i] as usize].y = y * num20;
        array12[0][array5[i] as usize].w = w * num20;
    }

    reader.seek(SeekFrom::Start(num3 as u64 + 4))?; // Go to some mysterious offset
    let mysterious_offset = (read_i32(&mut reader)? + 40) as i64;
    reader.seek(SeekFrom::Current(mysterious_offset))?; // Skip by mysterious offset
    let mut num21 = (30.0 / anim_fps) as i32;
    if env::args().count() > 1 {
        num21 = 1;
    } else {
        println!("Expanding {}x to {} fps", num21, anim_fps * num21 as f32);
    }

    let num22 = read_i32(&mut reader)?;
    println!("{} segments", num22);
    let mut num23 = 1;

    for _ in 0..num22 {
        let num24 = read_i32(&mut reader)?;
        let offset4 = reader.seek(SeekFrom::Current(0))? + num24 as u64;
        reader.seek(SeekFrom::Current(2))?;
        reader.seek(SeekFrom::Current(2))?;
        let num25 = read_i16(&mut reader)?;
        let frames = read_i16(&mut reader)?;
        println!("{} frames", frames);
        reader.seek(SeekFrom::Current(2))?;
        reader.seek(SeekFrom::Current(2))?;
        let num27 = read_i16(&mut reader)?;
        reader.seek(SeekFrom::Current(2))?;
        reader.seek(SeekFrom::Current(2))?;
        let num28 = read_i16(&mut reader)?;
        let num29 = read_i16(&mut reader)?;
        let num30 = read_i16(&mut reader)?;
        reader.seek(SeekFrom::Current(6))?;
        let num31 = read_i16(&mut reader)?;
        let num32 = read_i16(&mut reader)?;
        let num33 = read_i16(&mut reader)?;
        reader.seek(SeekFrom::Current(4))?;
        let vector3d6 = Vector3 {
            x: read_f32(&mut reader)?,
            y: read_f32(&mut reader)?,
            z: read_f32(&mut reader)?,
        };
        let mut vector3d7 = Vector3 {
            x: read_f32(&mut reader)?,
            y: read_f32(&mut reader)?,
            z: read_f32(&mut reader)?,
        };
        vector3d7 -= &vector3d6;
        reader.seek(SeekFrom::Current(92))?;
        let mut array13 = vec![Vector3::invalid(); num31 as usize];
        let mut array14 = vec![Vector3::invalid(); num31 as usize];
        for i in 0..num31 as usize {
            array13[i].x = read_f32(&mut reader)?;
            array13[i].y = read_f32(&mut reader)?;
            array13[i].z = read_f32(&mut reader)?;
            array14[i].x = read_f32(&mut reader)?;
            array14[i].y = read_f32(&mut reader)?;
            array14[i].z = read_f32(&mut reader)?;
            array14[i] -= &array13[i];
        }
        let mut array17: Vec<i32> = vec![0; num15 as usize];
        let mut array18: Vec<i32> = vec![0; num15 as usize];
        let mut array19: Vec<i32> = vec![0; num15 as usize];
        let mut array20: Vec<i32> = vec![0; num15 as usize];
        let mut array21: Vec<i32> = vec![0; num15 as usize];
        let mut array22: Vec<i32> = vec![0; num15 as usize];
        let mut array23: Vec<i32> = vec![0; num15 as usize];
        let mut array24: Vec<i32> = vec![0; num15 as usize];
        let mut array25: Vec<i32> = vec![0; num15 as usize];
        for i in 0..num15 as usize {
            array17[i] = read_u8(&mut reader)? as i32;
            array18[i] = read_u8(&mut reader)? as i32;
            array19[i] = read_u8(&mut reader)? as i32;
            array20[i] = read_u8(&mut reader)? as i32;
            array21[i] = read_u8(&mut reader)? as i32;
            array22[i] = read_u8(&mut reader)? as i32;
            array23[i] = read_u8(&mut reader)? as i32;
            array24[i] = read_u8(&mut reader)? as i32;
            array25[i] = read_u8(&mut reader)? as i32;
        }
        let _ = return_to_mysterious_start(&mut reader, position)?;
        let mut array26: Vec<u8> = vec![0; num28 as usize];
        for m in 0..frames as usize {
            let mut num36 = 0;
            reader.read_exact(&mut array26)?;
            for i in 0..num15 as usize {
                array11[m][array6[i] as usize] = Vector3::default();
                let mut num37 = 0;
                let mut num38 = 1;
                for _ in 0..array17[i] {
                    if array26[num36 / 8] >> (num36 % 8) & 1 != 0 { // line 333, had a uint cast and a ternary operator
                        num37 += num38;
                    }
                    num36 += 1;
                    num38 *= 2;
                }
                let mut num39 = array20[i] as f32 / 256.0 * vector3d7.x + vector3d6.x;
                array11[m][array6[i] as usize].x = num37 as f32 / num38 as f32 * array14[array23[i] as usize].x + array13[array23[i] as usize].x + num39;
                num37 = 0;
                num38 = 1;
                for _ in 0..array18[i] {
                    if array26[num36 / 8] >> (num36 % 8) & 1 != 0 {
                        num37 += num38;
                    }

                    num36 += 1;
                    num38 *= 2;
                }
                num39 = array21[i] as f32 / 256.0 * vector3d7.y + vector3d6.y;
                array11[m][array6[i] as usize].y = num37 as f32 / num38 as f32 * array14[array23[i] as usize].y + array13[array23[i] as usize].y + num39;
                num37 = 0;
                num38 = 1;
                for _ in 0..array19[i] {
                    if array26[num36 / 8] >> (num36 % 8) & 1 != 0 {
                        num37 += num38;
                    }

                    num36 += 1;
                    num38 *= 2;
                }
                num39 = array22[i] as f32 / 256.0 * vector3d7.z + vector3d6.z;
                array11[m][array6[i] as usize].z = num37 as f32 / num38 as f32 * array14[array25[i] as usize].z + array13[array25[i] as usize].z + num39;
            }
        }
        let _ = return_to_mysterious_start(&mut reader, position)?;

        let mut array27 = vec![Vector3::invalid(); num32 as usize];
        let mut array28 = vec![Vector3::invalid(); num32 as usize];
        for i in 0..num32 as usize {
            array27[i].x = read_f32(&mut reader)?;
            array27[i].y = read_f32(&mut reader)?;
            array27[i].z = read_f32(&mut reader)?;
            array28[i].x = read_f32(&mut reader)?;
            array28[i].y = read_f32(&mut reader)?;
            array28[i].z = read_f32(&mut reader)?;
            array28[i] -= &array27[i];
        }
        let mut array17: Vec<i32> = vec![0; num16 as usize];
        let mut array18: Vec<i32> = vec![0; num16 as usize];
        let mut array19: Vec<i32> = vec![0; num16 as usize];
        let mut array20: Vec<i32> = vec![0; num16 as usize];
        let mut array21: Vec<i32> = vec![0; num16 as usize];
        let mut array22: Vec<i32> = vec![0; num16 as usize];
        let mut array23: Vec<i32> = vec![0; num16 as usize];
        let mut array24: Vec<i32> = vec![0; num16 as usize];
        let mut array25: Vec<i32> = vec![0; num16 as usize];
        for i in 0..num16 as usize {
            array17[i] = read_u8(&mut reader)? as i32;
            array18[i] = read_u8(&mut reader)? as i32;
            array19[i] = read_u8(&mut reader)? as i32;
            array20[i] = read_u8(&mut reader)? as i32;
            array21[i] = read_u8(&mut reader)? as i32;
            array22[i] = read_u8(&mut reader)? as i32;
            array23[i] = read_u8(&mut reader)? as i32;
            array24[i] = read_u8(&mut reader)? as i32;
            array25[i] = read_u8(&mut reader)? as i32;
        }
        let _ = return_to_mysterious_start(&mut reader, position)?;
        let mut array26: Vec<u8> = vec![0; num29 as usize];
        for m in 0..frames as usize {
            let mut num36 = 0;
            reader.read_exact(&mut array26)?;
            for i in 0..num16 as usize {
                let mut quat = Quat4::default();
                quat.x = (array20[i] as f32) / 127.5 - 1.0;
                quat.y = (array21[i] as f32) / 127.5 - 1.0;
                quat.z = (array22[i] as f32) / 127.5 - 1.0;
                let num20 = quat.x * quat.x + quat.y * quat.y + quat.z * quat.z; // squared length?
                quat.w = (1.0 - num20) / 2.0;
                let num20 = 2.0 / (1.0 + num20);
                quat.x *= num20;
                quat.y *= num20;
                quat.z *= num20;
                quat.w *= num20;
                let mut num37 = 0;
                let mut num38 = 1;
                for _ in 0..array17[i] {
                    if ((array26[num36 / 8] >> (num36 % 8)) & 1) != 0 {
                        num37 += num38;
                    }
                    num36 += 1;
                    num38 *= 2;
                }
                let x = (num37 as f32) / (num38 as f32) * array28[array23[i] as usize].x + array27[array23[i] as usize].x;
                let mut num37 = 0;
                let mut num38 = 1;
                for _ in 0..array18[i] {
                    if ((array26[num36 / 8] >> (num36 % 8)) & 1) != 0 {
                        num37 += num38;
                    }
                    num36 += 1;
                    num38 *= 2;
                }
                let y = (num37 as f32) / (num38 as f32) * array28[array24[i] as usize].y + array27[array24[i] as usize].y;
                let mut num37 = 0;
                let mut num38 = 1;
                for _ in 0..array19[i] {
                    if ((array26[num36 / 8] >> (num36 % 8)) & 1) != 0 {
                        num37 += num38;
                    }
                    num36 += 1;
                    num38 *= 2;
                }
                let z = (num37 as f32) / (num38 as f32) * array28[array25[i] as usize].z + array27[array25[i] as usize].z;
                let num20 = x * x + y * y + z * z; // squared length?
                let w = (1.0 - num20) / 2.0;
                let num20 = 2.0 / (1.0 + num20);
                array12[m][array7[i] as usize] = Quat4 { x: x * num20, y: y * num20, z: z * num20, w: w * num20 };
                array12[m][array7[i] as usize] = quat * &array12[m][array7[i] as usize];
            }
        }
        let _ = return_to_mysterious_start(&mut reader, position)?;
        let mut array30: Vec<i32> = vec![0; num27 as usize];
        for i in 0..num27 as usize {
            array30[i] = read_i16(&mut reader)? as i32;
        }
        let _ = return_to_mysterious_start(&mut reader, position)?;
        let mut array31: Vec<Vector3> = vec![Vector3::invalid(); num33 as usize];
        let mut array32: Vec<Vector3> = vec![Vector3::invalid(); num33 as usize];
        for i in 0..num33 as usize {
            array31[i].x = read_f32(&mut reader)?;
            array31[i].y = read_f32(&mut reader)?;
            array31[i].z = read_f32(&mut reader)?;
            array32[i].x = read_f32(&mut reader)?;
            array32[i].y = read_f32(&mut reader)?;
            array32[i].z = read_f32(&mut reader)?;
            array32[i] -= &array31[i];
        }
        let mut array17: Vec<i32> = vec![0; num17 as usize];
        let mut array18: Vec<i32> = vec![0; num17 as usize];
        let mut array19: Vec<i32> = vec![0; num17 as usize];
        let mut array20: Vec<i32> = vec![0; num17 as usize];
        let mut array21: Vec<i32> = vec![0; num17 as usize];
        let mut array22: Vec<i32> = vec![0; num17 as usize];
        let mut array23: Vec<i32> = vec![0; num17 as usize];
        let mut array24: Vec<i32> = vec![0; num17 as usize];
        let mut array25: Vec<i32> = vec![0; num17 as usize];
        for i in 0..num17 as usize {
            array17[i] = read_u8(&mut reader)? as i32;
            array18[i] = read_u8(&mut reader)? as i32;
            array19[i] = read_u8(&mut reader)? as i32;
            array20[i] = read_u8(&mut reader)? as i32;
            array21[i] = read_u8(&mut reader)? as i32;
            array22[i] = read_u8(&mut reader)? as i32;
            array23[i] = read_u8(&mut reader)? as i32;
            array24[i] = read_u8(&mut reader)? as i32;
            array25[i] = read_u8(&mut reader)? as i32;
        }
        let _ = return_to_mysterious_start(&mut reader, position)?;
        let mut array26 = vec![0; num30 as usize];
        for m in 0..num27 as usize {
            let num42 = array30[m] - num25 as i32;
            let mut num36 = 0;
            reader.read_exact(&mut array26)?;
            for i in 0..num17 as usize {
                let num43 = array8[i] as usize;
                array11[num42 as usize][num43 as usize] = Vector3::default();
                let x = (array20[i] as f32) / 255.0 * vector3d7.x + vector3d6.x;
                let y = (array21[i] as f32) / 255.0 * vector3d7.y + vector3d6.y;
                let z = (array22[i] as f32) / 255.0 * vector3d7.z + vector3d6.z;
                let mut num37 = 0;
                let mut num38 = 1;
                for _ in 0..array17[i] as usize {
                    if ((array26[num36 / 8] >> (num36 % 8)) & 1) != 0 {
                        num37 += num38;
                    }
                    num36 += 1;
                    num38 *= 2;
                }
                if num37 > 0 {
                    num38 -= 1;
                }
                array11[num42 as usize][array8[i] as usize].x = (num37 as f32) / (num38 as f32) * array32[array23[i] as usize].x + array31[array23[i] as usize].x + x;
                let mut num37 = 0;
                let mut num38 = 1;
                for _ in 0..array18[i] {
                    if ((array26[num36 / 8] >> (num36 % 8)) & 1) != 0 {
                        num37 += num38;
                    }
                    num36 += 1;
                    num38 *= 2;
                }
                if num37 > 0 {
                    num38 -= 1;
                }
                array11[num42 as usize][array8[i] as usize].y = (num37 as f32) / (num38 as f32) * array32[array24[i] as usize].y + array31[array24[i] as usize].y + y;
                let mut num37 = 0;
                let mut num38 = 1;
                for _ in 0..array19[i] as usize {
                    if ((array26[num36 / 8] >> (num36 % 8)) & 1) != 0 {
                        num37 += num38;
                    }
                    num36 += 1;
                    num38 *= 2;
                }
                if num37 > 0 {
                    num38 -= 1;
                }
                array11[num42 as usize][array8[i] as usize].z = (num37 as f32) / (num38 as f32) * array32[array25[i] as usize].z + array31[array25[i] as usize].z + z;
                if m > 0 {
                    let num44 = array30[m - 1] - num25 as i32;
                    let _ = 1.0 / ((num42 - num44) as f32);
                    let num45 = (array11[num42 as usize][num43].x - array11[num44 as usize][num43].x) / ((num42 - num44) as f32);
                    let num46 = (array11[num42 as usize][num43].y - array11[num44 as usize][num43].y) / ((num42 - num44) as f32);
                    let num47 = (array11[num42 as usize][num43].z - array11[num44 as usize][num43].z) / ((num42 - num44) as f32);
                    for num48 in 1..(num42 - num44 as i32) {
                        array11[(num44 + num48) as usize][num43] = Vector3 {
                            x: num45 * (num48 as f32) + array11[num44 as usize][num43].x,
                            y: num46 * (num48 as f32) + array11[num44 as usize][num43].y,
                            z: num47 * (num48 as f32) + array11[num44 as usize][num43].z,
                        };
                    }
                }
            }
        }
        for m in 0..frames as usize {
            for i in (1..num12 as usize).rev() {
                if !array10[i] {
                    continue;
                }

                let mut num49 = array[i + 1] - 1;
                let mut quat2: Quat4;
                if !array10[num49 as usize] {
                    quat2 = array12[0][num49 as usize].clone();
                    loop {
                        num49 = array[num49 as usize + 1] - 1;
                        if array10[num49 as usize] {
                            break;
                        }

                        quat2 = quat2 * &array12[0][num49 as usize];
                    }

                    if num49 > 0 {
                        quat2 = quat2 * &array12[m][num49 as usize];
                    }
                } else {
                    quat2 = array12[m][num49 as usize].clone();
                };

                let quat3 = Quat4 {
                    x: quat2.x,
                    y: quat2.y,
                    z: quat2.z,
                    w: 0.0 - quat2.w,
                };
                array12[m][i] = quat3 * &array12[m][i];
            }
        }
        for m in 0..(frames - 1) as usize {
            for _ in 0..num21 {
                stream.write_str(&format!("time {}\n", num23))?;
                num23 += 1;
            }
            stream.write_str(&format!("0  0 0 0  0 0 0\n"))?;
            for i in 0..num12 as usize {
                if array12[0][i].is_invalid() || array11[0][i].is_invalid() {
                    continue;
                }
                let mut num50 = m;
                let mut num51 = m;
                if !array12[m][i].is_invalid() || !array11[m][i].is_invalid() {
                    if array11[m][i].is_invalid() {
                        num51 = 0;
                    }
                    if array12[m][i].is_invalid() {
                        num50 = 0;
                    }
                    let vector3d = array12[num50][i].to_euler_angles();
                    stream.write_str(&format!("{}  {:.6} {:.6} {:.6}  {:.6} {:.6} {:.6}\n", i + 1, array11[num51][i].x * VEC_SCALE, array11[num51][i].y * VEC_SCALE, array11[num51][i].z * VEC_SCALE, vector3d.x, vector3d.y, vector3d.z))?;
                }
            }
        }
        reader.seek(SeekFrom::Start(offset4))?;
    }
    stream.write_str("end\n")?;

    let mut output = File::create("debug.smd")?;
    std::io::Write::write(&mut output, stream.as_bytes())?;

    // println!("{}", stream);
    Ok(())
}

/**
 * I think this returns back to the start of vector/quaternion data
 */
fn return_to_mysterious_start<R: Read + Seek>(reader: &mut R, position: i32) -> Result<(), io::Error> {
    let current_pos = reader.seek(SeekFrom::Current(0))?;
    reader.seek(SeekFrom::Start(((current_pos - position as u64 + 3) & WHAT as u64) + position as u64))?;
    Ok(())
}
