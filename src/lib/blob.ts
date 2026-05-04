import { put, del } from "@vercel/blob";

export async function uploadAttachment(
  file: File,
  orgId: string,
  ticketId: string
): Promise<{ url: string; pathname: string }> {
  const ext = file.name.split(".").pop() ?? "bin";
  const pathname = `attachments/${orgId}/${ticketId}/${Date.now()}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
  });

  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteAttachment(url: string): Promise<void> {
  await del(url);
}
