/**
 * Main entry point for the application
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    UI.initialize();
    ModalManager.initialize();
    DescriptionEditor.initialize();
    BatchGenerator.initialize();

    // Set up search functionality
    UI.elements.searchInput.addEventListener('input', (e) => {
        UI.renderModelsList(e.target.value);
    });

    // Set up file input
    UI.elements.fileInput.addEventListener('change', handleFileSelect);

    // Export button handler
    // UI.elements.exportButton.addEventListener('click', ExportManager.exportManifest);
});

/**
 * Handle file selection
 * @param {Event} event - The file change event
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    UI.showLoading();

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // Parse manifest and render models
            ModelStore.parseManifest(e.target.result);
            UI.renderModelsList();
            UI.showContent();
        } catch (error) {
            alert('Error parsing manifest.json: ' + error.message);
            UI.showInitialMessage();
        }
    };
    reader.readAsText(file);
}