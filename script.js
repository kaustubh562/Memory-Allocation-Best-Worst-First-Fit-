
const blocksInput = document.getElementById("blocks");
const processesInput = document.getElementById("processes");
const tableBody = document.getElementById("tableBody");

const totalMemory = document.getElementById("totalMemory");
const allocatedCount = document.getElementById("allocatedCount");
const failedCount = document.getElementById("failedCount");
const remainingMemory = document.getElementById("remainingMemory");

const resultTag = document.getElementById("resultTag");
const tableTitle = document.getElementById("tableTitle");
const tableSubtitle = document.getElementById("tableSubtitle");

let activeMethod = "";

function readNumbers(input) {
    const value = input.value.trim();

    if (!value) {
        throw new Error("Please enter all required values.");
    }

    const values = value.split(",").map(item => item.trim());

    if (values.some(item => item === "")) {
        throw new Error("Please enter valid comma-separated numbers.");
    }

    const numbers = values.map(Number);

    if (numbers.some(number =>
        !Number.isFinite(number) || number <= 0)) {
        throw new Error("All sizes must be positive numbers.");
    }

    return numbers;
}

function allocate(method) {
    try {
        const blocks = readNumbers(blocksInput);
        const processes = readNumbers(processesInput);

        const memory = [...blocks];
        const rows = [];

        let allocated = 0;
        let failed = 0;

        for (let i = 0; i < processes.length; i++) {
            const size = processes[i];
            let selected = -1;

            for (let j = 0; j < memory.length; j++) {
                if (memory[j] >= size) {
                    if (selected === -1) {
                        selected = j;
                    } else if (
                        method === "best" &&
                        memory[j] < memory[selected]
                    ) {
                        selected = j;
                    } else if (
                        method === "worst" &&
                        memory[j] > memory[selected]
                    ) {
                        selected = j;
                    }

                    if (method === "first") {
                        break;
                    }
                }
            }

            if (selected !== -1) {
                memory[selected] -= size;
                allocated++;

                rows.push({
                    process: "P" + (i + 1),
                    size: size,
                    block: "B" + (selected + 1),
                    remaining: memory[selected],
                    success: true
                });
            } else {
                failed++;

                rows.push({
                    process: "P" + (i + 1),
                    size: size,
                    block: "—",
                    remaining: "—",
                    success: false
                });
            }
        }

        displayResults(method, blocks, memory, rows, allocated, failed);

        activeMethod = method;

        document.querySelectorAll(".algorithm-btn").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.method === method
            );
        });

    } catch (error) {
        resultTag.textContent = "INPUT ERROR";

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;
    }
}

function displayResults(method, blocks, memory, rows, allocated, failed) {
    const names = {
        first: "First Fit",
        best: "Best Fit",
        worst: "Worst Fit"
    };

    totalMemory.textContent =
        blocks.reduce((sum, size) => sum + size, 0) + " KB";

    allocatedCount.textContent = allocated;
    failedCount.textContent = failed;

    remainingMemory.textContent =
        memory.reduce((sum, size) => sum + size, 0) + " KB";

    resultTag.textContent = names[method].toUpperCase();
    tableTitle.textContent = names[method] + " Report";

    tableSubtitle.textContent =
        "Process allocation results and remaining block capacity.";

    tableBody.innerHTML = rows.map(row => `
        <tr>
            <td class="process-name">${row.process}</td>
            <td>${row.size} KB</td>
            <td>${row.block}</td>
            <td>${row.remaining === "—"
                ? "—"
                : row.remaining + " KB"}</td>
            <td>
                <span class="status-badge ${
                    row.success ? "allocated" : "not-allocated"
                }">
                    ${row.success ? "Allocated" : "Not Allocated"}
                </span>
            </td>
        </tr>
    `).join("");
}

function escapeHTML(value) {
    return value.replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

document.querySelectorAll(".algorithm-btn").forEach(button => {
    button.addEventListener("click", () => {
        allocate(button.dataset.method);
    });
});

document.getElementById("resetBtn").addEventListener("click", () => {
    blocksInput.value = "100, 500, 200, 300, 600";
    processesInput.value = "212, 417, 112, 426";

    activeMethod = "";

    totalMemory.textContent = "—";
    allocatedCount.textContent = "—";
    failedCount.textContent = "—";
    remainingMemory.textContent = "—";

    resultTag.textContent = "AWAITING INPUT";
    tableTitle.textContent = "Allocation Details";
    tableSubtitle.textContent =
        "Select an algorithm to generate the report.";

    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="empty-state">
                No results available. Select an allocation
                algorithm to begin.
            </td>
        </tr>
    `;

    document.querySelectorAll(".algorithm-btn").forEach(button => {
        button.classList.remove("active");
    });
});
