// Reacher - Email Verification
// Copyright (C) 2018-2023 Reacher

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

use serde::Serialize;
use std::convert::TryFrom;

/// Wrapper for serde json value to convert
/// into a csv response
#[derive(Debug)]
pub struct CsvWrapper(pub serde_json::Value);

/// Simplified output of `CheckEmailOutput` struct
/// for csv fields.
#[derive(Debug, Serialize)]
pub struct CsvResponse {
	input: String,
	is_reachable: String,
	#[serde(rename = "is_disposable")]
	is_disposable: bool,
	#[serde(rename = "is_role_account")]
	is_role_account: bool,
	#[serde(rename = "is_catch_all")]
	is_catch_all: bool,
	error: Option<String>,
}

impl TryFrom<CsvWrapper> for CsvResponse {
	type Error = &'static str;

	fn try_from(value: CsvWrapper) -> Result<Self, Self::Error> {
		let top_level = value
			.0
			.as_object()
			.ok_or("Failed to find top level object")?;

		let input = top_level
			.get("input")
			.and_then(|v| v.as_str())
			.ok_or("input should be a string")?
			.to_string();
		let is_reachable = top_level
			.get("is_reachable")
			.and_then(|v| v.as_str())
			.ok_or("is_reachable should be a string")?
			.to_string();

		let misc = top_level.get("misc").and_then(|v| v.as_object());
		let is_disposable = misc.and_then(|m| m.get("is_disposable")).and_then(|v| v.as_bool()).unwrap_or(false);
		let is_role_account = misc.and_then(|m| m.get("is_role_account")).and_then(|v| v.as_bool()).unwrap_or(false);

		let smtp = top_level.get("smtp").and_then(|v| v.as_object());
		let is_catch_all = smtp.and_then(|s| s.get("is_catch_all")).and_then(|v| v.as_bool()).unwrap_or(false);

		let error = top_level.get("error").map(|v| v.to_string());

		Ok(CsvResponse {
			input,
			is_reachable,
			is_disposable,
			is_role_account,
			is_catch_all,
			error,
		})
	}
}
