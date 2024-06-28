const FLOAT_PRECISION: usize = 3;

pub fn format_float(value: f64) -> String {
    let formatted = format!("{:.*}", FLOAT_PRECISION, value);
    if formatted.contains('.') {
        formatted.trim_end_matches('0').trim_end_matches('.').to_string()
    } else {
        formatted
    }
}
