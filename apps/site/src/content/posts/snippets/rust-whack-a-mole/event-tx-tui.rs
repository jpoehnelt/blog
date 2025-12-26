#[tokio::main]
async fn main() {
    // Event channel Many -> 1
    let (event_tx, mut event_rx): (mpsc::Sender<i32>, mpsc::Receiver<i32>) = mpsc::channel(16);

    // Event tx is cloned for each task that needs to send events.
    let event_tx_tui = event_tx.clone();
    let event_tx_world = event_tx.clone();

    // State channel 1-> many
    let (state_tx, state_rx): (broadcast::Sender<i32>, broadcast::Receiver<i32>) =
        broadcast::channel(16);

    // State rx is subscribed for each task that needs to receive state.
    let mut state_rx_tui = state_rx.resubscribe();

    tokio::select! {
        _ = tokio::signal::ctrl_c() => (),
        // Controller listens to events and updates state which it broadcasts
        _ = controller(&state_tx, &mut event_rx) => (), // Controller
        // Events from plex server, plexamp/chromecast, and the local network
        _ = world(&event_tx_world) => (),
        // TUI listens to state and renders the terminal
        _ = tui(&mut state_rx_tui, &event_tx_tui) => (),
        // CrossTerm listens to terminal events and filters/forwards them on the event channel
        // TODO
    }
}