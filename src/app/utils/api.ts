import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-defea855`;

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

export async function addUrl(url: string) {
  const response = await fetch(`${BASE_URL}/add-url`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add URL');
  }

  return response.json();
}

export async function processDocument(id: string) {
  const response = await fetch(`${BASE_URL}/process/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Processing failed');
  }

  return response.json();
}

export async function getRawMaterials() {
  const response = await fetch(`${BASE_URL}/raw-materials`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get materials');
  }

  return response.json();
}

export async function getWikiPages() {
  const response = await fetch(`${BASE_URL}/wiki-pages`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get wiki pages');
  }

  return response.json();
}

export async function askQuestion(question: string) {
  const response = await fetch(`${BASE_URL}/ask`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Question failed');
  }

  return response.json();
}

export async function deleteMaterial(id: string) {
  const response = await fetch(`${BASE_URL}/raw-materials/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Delete failed');
  }

  return response.json();
}