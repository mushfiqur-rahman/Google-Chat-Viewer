/**
 * Recursively extracts File objects from a DataTransferItemList,
 * supporting dropped directories, nested folders, ZIP files, and individual files.
 */

async function readFileEntry(fileEntry: any, path: string): Promise<File> {
  return new Promise((resolve, reject) => {
    fileEntry.file(
      (file: File) => {
        // Define relative path property if not present
        const fullPath = path ? `${path}/${file.name}` : file.name;
        Object.defineProperty(file, 'webkitRelativePath', {
          value: fullPath,
          writable: true,
          configurable: true,
        });
        resolve(file);
      },
      (error: any) => reject(error)
    );
  });
}

async function readDirectoryEntries(dirReader: any): Promise<any[]> {
  const allEntries: any[] = [];
  const readBatch = (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      dirReader.readEntries(
        (entries: any[]) => resolve(entries),
        (error: any) => reject(error)
      );
    });
  };

  // readEntries may return in batches, so read until empty
  let batch = await readBatch();
  while (batch.length > 0) {
    allEntries.push(...batch);
    batch = await readBatch();
  }

  return allEntries;
}

async function traverseEntry(entry: any, currentPath: string = ''): Promise<File[]> {
  const files: File[] = [];

  if (entry.isFile) {
    try {
      const file = await readFileEntry(entry, currentPath);
      files.push(file);
    } catch (e) {
      console.warn('Could not read file entry:', entry.name, e);
    }
  } else if (entry.isDirectory) {
    const nextPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
    const dirReader = entry.createReader();
    try {
      const entries = await readDirectoryEntries(dirReader);
      for (const childEntry of entries) {
        const childFiles = await traverseEntry(childEntry, nextPath);
        files.push(...childFiles);
      }
    } catch (e) {
      console.warn('Could not read directory entry:', entry.name, e);
    }
  }

  return files;
}

export async function getFilesFromDataTransfer(dataTransfer: DataTransfer): Promise<File[]> {
  const files: File[] = [];

  // Check if items and webkitGetAsEntry are available
  if (dataTransfer.items && dataTransfer.items.length > 0) {
    const entryPromises: Promise<File[]>[] = [];

    for (let i = 0; i < dataTransfer.items.length; i++) {
      const item = dataTransfer.items[i];
      if (item.kind !== 'file') continue;

      if (typeof item.webkitGetAsEntry === 'function') {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          entryPromises.push(traverseEntry(entry, ''));
          continue;
        }
      }

      // Fallback
      const file = item.getAsFile();
      if (file) {
        files.push(file);
      }
    }

    if (entryPromises.length > 0) {
      const nestedFilesArrays = await Promise.all(entryPromises);
      for (const nestedFiles of nestedFilesArrays) {
        files.push(...nestedFiles);
      }
    }
  } else if (dataTransfer.files && dataTransfer.files.length > 0) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      files.push(dataTransfer.files[i]);
    }
  }

  return files;
}
