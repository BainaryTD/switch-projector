export class Playlist {
    constructor(containerId, onSelectFile, onClearHold) {
        this.container = document.getElementById(containerId);
        this.queue = [];
        this.onSelectFile = onSelectFile;
        this.onClearHold = onClearHold;
        this.activeFile = null;
    }

    getQueue() {
        return this.queue;
    }

    addFiles(files) {
        this.queue = this.queue.concat(files);
        this.render();
    }

    remove(index, filePath) {
        this.queue.splice(index, 1);
        if (filePath === this.activeFile) {
            this.clearActive();
        } else {
            this.render();
        }
    }

    setActive(filePath) {
        this.activeFile = filePath;
        this.onSelectFile(filePath);
        this.render();
    }

    clearActive() {
        this.activeFile = null;
        this.onClearHold();
        this.render();
    }

    moveActive(delta) {
        if (this.queue.length === 0) return;
        const curIdx = this.activeFile ? this.queue.indexOf(this.activeFile) : -1;
        let nextIdx;
        if (curIdx === -1) {
            nextIdx = delta > 0 ? 0 : this.queue.length - 1;
        } else {
            nextIdx = Math.max(0, Math.min(this.queue.length - 1, curIdx + delta));
        }
        if (this.queue[nextIdx] && this.queue[nextIdx] !== this.activeFile) {
            this.setActive(this.queue[nextIdx]);
        }
    }

    removeActive() {
        if (!this.activeFile) return;
        const idx = this.queue.indexOf(this.activeFile);
        if (idx >= 0) this.remove(idx, this.activeFile);
    }

    reorder(from, to) {
        if (from === to || from < 0 || to < 0) return;
        if (from >= this.queue.length || to >= this.queue.length) return;
        const [moved] = this.queue.splice(from, 1);
        this.queue.splice(to, 0, moved);
        this.render();
    }

    render() {
        this.container.innerHTML = '';

        if (this.queue.length === 0) {
            this.container.innerHTML = '<div class="flex items-center justify-center w-full h-full text-zinc-500 italic py-4">Queue is empty</div>';
            return;
        }

        this.queue.forEach((filePath, index) => {
            const itemObj = document.createElement('div');
            itemObj.className = 'flex justify-between items-center px-3 py-2 bg-[#222] mb-1 rounded cursor-pointer border-l-4 border-transparent hover:bg-[#333] transition-colors';
            if (filePath === this.activeFile) itemObj.classList.add('!border-blue-500', '!bg-[#2a2a2a]');
            itemObj.draggable = true;

            const grip = document.createElement('span');
            grip.className = 'text-zinc-500 mr-2 select-none cursor-grab';
            grip.innerText = '⋮⋮';

            const itemName = document.createElement('div');
            itemName.className = 'text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis';
            itemName.innerText = filePath.split('\\').pop() || filePath;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'text-red-500 hover:text-white text-xl px-2 bg-transparent border-none cursor-pointer';
            deleteBtn.innerHTML = '×';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                this.remove(index, filePath);
            };

            itemObj.onclick = () => {
                this.setActive(filePath);
            };

            itemObj.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('application/x-queue-index', String(index));
                itemObj.classList.add('opacity-50');
            });
            itemObj.addEventListener('dragend', () => {
                itemObj.classList.remove('opacity-50');
            });
            itemObj.addEventListener('dragover', (e) => {
                if (e.dataTransfer.types.includes('application/x-queue-index')) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    itemObj.classList.add('ring-2', 'ring-blue-500');
                }
            });
            itemObj.addEventListener('dragleave', () => {
                itemObj.classList.remove('ring-2', 'ring-blue-500');
            });
            itemObj.addEventListener('drop', (e) => {
                const raw = e.dataTransfer.getData('application/x-queue-index');
                if (raw === '') return;
                e.preventDefault();
                e.stopPropagation();
                itemObj.classList.remove('ring-2', 'ring-blue-500');
                const from = parseInt(raw, 10);
                if (!isNaN(from)) this.reorder(from, index);
            });

            itemObj.appendChild(grip);
            itemObj.appendChild(itemName);
            itemObj.appendChild(deleteBtn);
            this.container.appendChild(itemObj);
        });
    }
}
