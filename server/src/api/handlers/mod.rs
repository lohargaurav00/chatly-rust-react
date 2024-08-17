use actix_web::web;

pub mod rooms;
pub mod users;

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.configure(users::init_routes);
    cfg.configure(rooms::init_routes);
}
