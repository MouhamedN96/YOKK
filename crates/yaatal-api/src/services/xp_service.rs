//! XP integration service — awards gamification points on user actions.
//!
//! Wraps `yaatal_core::gamification::xp` and persists XP increments to the profiles table.

use loco_rs::prelude::*;
use sea_orm::{ActiveValue::Set, EntityTrait};
use yaatal_core::gamification::xp::XpAction;
// Re-use the yaatal-core profile model for DB operations
use yaatal_core::models::profile;

/// Award XP for the given action, incrementing the profile's `xp` column.
///
/// Returns the new XP total.
///
/// # Errors
///
/// Returns `loco_rs::Error` if the profile is not found or the DB update fails.
pub async fn award_xp(
    db: &sea_orm::DatabaseConnection,
    profile_id: &str,
    action: XpAction,
) -> Result<i32> {
    let profile = profile::Entity::find_by_id(profile_id)
        .one(db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let points = action.points() as i32;
    let new_xp = profile.xp + points;

    let mut active: profile::ActiveModel = profile.into();
    active.xp = Set(new_xp);
    profile::Entity::update(active).exec(db).await?;

    Ok(new_xp)
}
