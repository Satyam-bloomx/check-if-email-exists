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
	#[serde(rename = "misc.is_disposable")]
	misc_is_disposable: bool,
	#[serde(rename = "misc.is_role_account")]
	misc_is_role_account: bool,
	#[serde(rename = "misc.gravatar_url")]
	misc_gravatar_url: Option<String>,
	#[serde(rename = "mx.accepts_mail")]
	mx_accepts_mail: bool,
	#[serde(rename = "smtp.can_connect")]
	smtp_can_connect: bool,
	#[serde(rename = "smtp.has_full_inbox")]
	smtp_has_full_inbox: bool,
	#[serde(rename = "smtp.is_catch_all")]
	smtp_is_catch_all: bool,
	#[serde(rename = "smtp.is_deliverable")]
	smtp_is_deliverable: bool,
	#[serde(rename = "smtp.is_disabled")]
	smtp_is_disabled: bool,
	#[serde(rename = "syntax.is_valid_syntax")]
	syntax_is_valid_syntax: bool,
	#[serde(rename = "syntax.domain")]
	syntax_domain: String,
	#[serde(rename = "syntax.username")]
	syntax_username: String,
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
		let misc_is_disposable = misc.and_then(|m| m.get("is_disposable")).and_then(|v| v.as_bool()).unwrap_or(false);
		let misc_is_role_account = misc.and_then(|m| m.get("is_role_account")).and_then(|v| v.as_bool()).unwrap_or(false);
		let misc_gravatar_url = misc.and_then(|m| m.get("gravatar_url")).and_then(|v| v.as_str()).map(|s| s.to_string());

		let mx = top_level.get("mx").and_then(|v| v.as_object());
		let mx_accepts_mail = mx.and_then(|m| m.get("accepts_mail")).and_then(|v| v.as_bool()).unwrap_or(false);

		let smtp = top_level.get("smtp").and_then(|v| v.as_object());
		let smtp_can_connect = smtp.and_then(|s| s.get("can_connect_smtp")).and_then(|v| v.as_bool()).unwrap_or(false);
		let smtp_has_full_inbox = smtp.and_then(|s| s.get("has_full_inbox")).and_then(|v| v.as_bool()).unwrap_or(false);
		let smtp_is_catch_all = smtp.and_then(|s| s.get("is_catch_all")).and_then(|v| v.as_bool()).unwrap_or(false);
		let smtp_is_deliverable = smtp.and_then(|s| s.get("is_deliverable")).and_then(|v| v.as_bool()).unwrap_or(false);
		let smtp_is_disabled = smtp.and_then(|s| s.get("is_disabled")).and_then(|v| v.as_bool()).unwrap_or(false);

		let syntax = top_level.get("syntax").and_then(|v| v.as_object());
		let syntax_is_valid_syntax = syntax.and_then(|s| s.get("is_valid_syntax")).and_then(|v| v.as_bool()).unwrap_or(false);
		let syntax_domain = syntax.and_then(|s| s.get("domain")).and_then(|v| v.as_str()).unwrap_or("").to_string();
		let syntax_username = syntax.and_then(|s| s.get("username")).and_then(|v| v.as_str()).unwrap_or("").to_string();

		let error = top_level.get("error").map(|v| v.to_string());

		Ok(CsvResponse {
			input,
			is_reachable,
			misc_is_disposable,
			misc_is_role_account,
			misc_gravatar_url,
			mx_accepts_mail,
			smtp_can_connect,
			smtp_has_full_inbox,
			smtp_is_catch_all,
			smtp_is_deliverable,
			smtp_is_disabled,
			syntax_is_valid_syntax,
			syntax_domain,
			syntax_username,
			error,
		})
	}
}
