use actix_web::web;

pub mod handlers;

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    let scope = web::scope("/api").configure(handlers::init_routes);
    cfg.service(scope);
}
