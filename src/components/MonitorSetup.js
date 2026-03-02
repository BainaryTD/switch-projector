export class MonitorSetup {
    static async init(selectId) {
        const select = document.getElementById(selectId);
        const monitors = await window.electronAPI.getMonitors();
        monitors.forEach((m, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.text = `Monitor ${i + 1} (${m.bounds.width}x${m.bounds.height})`;
            select.appendChild(opt);
        });
    }

    static changeMonitor(selectId) {
        const select = document.getElementById(selectId);
        window.electronAPI.setMonitor(parseInt(select.value));
    }
}
