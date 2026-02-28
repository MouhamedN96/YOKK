//! SeaORM repository implementations for yaatal-feed pipeline.

pub mod post_repository;
pub mod discovery_repository;

pub use post_repository::SeaOrmPostRepository;
pub use discovery_repository::SeaOrmDiscoveryRepository;
