use tauri::{Emitter, Manager};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn update_score(file_name: &str, app_handle: tauri::AppHandle) -> () {
    app_handle.emit("scoreChanged", file_name).unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
    .on_window_event(move |window, event| match event {
        tauri::WindowEvent::Destroyed => {
            window.app_handle().exit(0);
        }
        _ => {}
    })
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![update_score])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
