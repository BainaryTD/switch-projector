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

            itemObj.appendChild(itemName);
            itemObj.appendChild(deleteBtn);
            this.container.appendChild(itemObj);
        });
    }
}
