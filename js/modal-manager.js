/**
 * Modal Manager - Handles modal creation and base functionality
 */
const ModalManager = {
    modals: {},

    /**
     * Initialize modals
     */
    initialize() {
        // Create modals if they don't exist
        if (!document.getElementById('descriptionModal')) {
            this.createDescriptionModal();
        }

        if (!document.getElementById('batchDescriptionModal')) {
            this.createBatchModal();
        }
    },

    /**
     * Create description editor modal
     */
    createDescriptionModal() {
        const modal = document.createElement('div');
        modal.id = 'descriptionModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden';

        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-screen flex flex-col">
                <div class="flex justify-between items-center border-b p-4">
                    <h3 class="text-xl font-semibold" id="modalTitle">Edit Column Description</h3>
                    <button id="closeModal" class="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="flex flex-grow overflow-hidden">
                    <!-- Left column - Column Information -->
                    <div class="w-1/2 p-4 border-r overflow-y-auto">
                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <label class="block text-sm font-medium text-gray-700">Column Name</label>
                            </div>
                            <div id="columnNameDisplay" class="p-2 bg-gray-100 rounded font-medium"></div>
                        </div>

                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <label class="block text-sm font-medium text-gray-700">Table Info</label>
                            </div>
                            <div id="tableInfoDisplay" class="p-2 bg-gray-100 rounded text-sm"></div>
                        </div>

                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <label class="block text-sm font-medium text-gray-700">Current Description</label>
                            </div>
                            <div id="currentDescriptionDisplay" class="p-2 bg-gray-100 rounded text-sm min-h-16"></div>
                        </div>

                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <label for="businessContext" class="block text-sm font-medium text-gray-700">Business Context (optional)</label>
                            </div>
                            <textarea id="businessContext" rows="3" class="w-full border rounded p-2"
                                placeholder="Add business context to help generate better descriptions"></textarea>
                        </div>
                    </div>

                    <!-- Right column - Revisions -->
                    <div class="w-1/2 p-4 flex flex-col overflow-hidden">
                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <label class="block text-sm font-medium text-gray-700">Latest Description</label>
                            </div>
                            <textarea id="latestDescription" rows="4" class="w-full border rounded p-2"></textarea>
                        </div>

                        <div class="mb-4">
                            <div class="flex space-x-2">
                                <input id="userFeedback" type="text" class="flex-grow border rounded p-2"
                                    placeholder="Provide feedback for next revision...">
                                <button id="generateRevision" class="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">
                                    AI Improve
                                </button>
                            </div>
                        </div>

                        <div id="revisionHistory" class="border rounded flex-grow flex flex-col overflow-hidden">
                            <div class="bg-gray-50 p-3 border-b">
                                <h4 class="font-medium">Revision History</h4>
                            </div>
                            <div class="flex-grow overflow-y-auto">
                                <table class="min-w-full table-auto border-collapse" id="revisionsTable">
                                    <thead>
                                        <tr class="bg-gray-100 border-b sticky top-0">
                                            <th class="text-left p-2">#</th>
                                            <th class="text-left p-2">Description</th>
                                            <th class="text-left p-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="border-t p-4 flex justify-end space-x-3">
                    <button id="saveBtn" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Save Description
                    </button>
                </div>
            </div>
        `;


        document.body.appendChild(modal);
        this.modals.descriptionModal = modal;

        // Set up basic close handlers
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal('descriptionModal'));
    },

    /**
     * Create batch description modal
     */
    createBatchModal() {
        const batchModal = document.createElement('div');
        batchModal.id = 'batchDescriptionModal';
        batchModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden';

        batchModal.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen flex flex-col">
                <div class="flex justify-between items-center border-b p-4">
                    <h3 class="text-xl font-semibold">Generate All Column Descriptions</h3>
                    <button id="closeBatchModal" class="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="p-4 flex-grow overflow-auto">
                    <div class="mb-4">
                        <h4 class="font-medium text-gray-800 mb-2">Table: <span id="batchModelName" class="font-bold"></span></h4>
                        <p id="batchModelDescription" class="text-sm text-gray-600 mb-4"></p>

                        <div class="mb-4">
                            <label for="tableDescription" class="block text-sm font-medium text-gray-700 mb-2">
                                What does this table do? (optional)
                            </label>
                            <textarea id="tableDescription" rows="3" class="w-full border rounded p-2"
                                placeholder="Describe the purpose and function of this table..."></textarea>
                        </div>

                        <div class="mb-4">
                            <label for="batchBusinessContext" class="block text-sm font-medium text-gray-700 mb-2">
                                Business Context
                            </label>
                            <textarea id="batchBusinessContext" rows="4" class="w-full border rounded p-2"
                                placeholder="Provide business context to help generate accurate descriptions..."></textarea>
                        </div>
                    </div>

                    <div id="batchProgress" class="hidden">
                        <div class="mb-2 flex justify-between text-sm">
                            <span>Generating descriptions...</span>
                            <span id="progressCounter">0/0</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div id="progressBar" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
                        </div>
                    </div>
                </div>

                <div class="border-t p-4 flex justify-end space-x-3">
                    <button id="cancelBatchBtn" class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">
                        Cancel
                    </button>
                    <button id="startGenerationBtn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Generate Descriptions
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(batchModal);
        this.modals.batchModal = batchModal;

        // Set up basic close handlers
        document.getElementById('closeBatchModal').addEventListener('click', () => this.closeModal('batchModal'));
        document.getElementById('cancelBatchBtn').addEventListener('click', () => this.closeModal('batchModal'));
    },

    /**
     * Show a modal by id
     * @param {string} modalId - ID of the modal to show ('descriptionModal' or 'batchModal')
     */
    showModal(modalId) {
        const modal = modalId === 'batchModal' ? this.modals.batchModal : this.modals.descriptionModal;
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    /**
     * Close a modal by id
     * @param {string} modalId - ID of the modal to close ('descriptionModal' or 'batchModal')
     */
    closeModal(modalId) {
        const modal = modalId === 'batchModal' ? this.modals.batchModal : this.modals.descriptionModal;
        if (modal) {
            modal.classList.add('hidden');
        }
    }
};