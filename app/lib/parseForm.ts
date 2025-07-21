
import formidable, { File } from 'formidable';

export interface ParsedForm {
    fields: Record<string, string>;
    file: File | null;
}

export async function parseForm(req: Request): Promise<ParsedForm> {
    const form = formidable({ maxFileSize: 5 * 1024 * 1024 }); // 5 MB
    return new Promise((resolve, reject) => {
        form.parse(req as any, (err, fields, files) => {
            if (err) return reject(err);
            const file = (files.attachment as unknown as File) || null;
            resolve({ fields: fields as unknown as Record<string, string>, file });
        });
    });
}
