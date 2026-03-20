import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(api.uploads.create.path, {
        method: api.uploads.create.method,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al subir el archivo");
      }
      
      const data = await res.json();
      return api.uploads.create.responses[201].parse(data);
    },
  });
}
