import fs from 'fs';

export function watchFiles(files: string[], callback: () => void) {
    files.forEach((file) => {
        if (fs.existsSync(file)) {
            fs.watch(file, { persistent: false }, () => {
                callback();
            });
        }
    })
}