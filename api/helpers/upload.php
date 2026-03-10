<?php
// ─────────────────────────────────────────────────────────────
// upload.php — Image upload helper
// Extracted from the original upload.php endpoint.
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/security.php';

/**
 * Process an uploaded image file.
 *
 * @param array  $file     The $_FILES['image'] array.
 * @return array           ['url' => '...', 'filename' => '...']
 */
function processImageUpload(array $file): array {
    // Validate upload error
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $messages = [
            UPLOAD_ERR_INI_SIZE   => 'File exceeds server limit',
            UPLOAD_ERR_FORM_SIZE  => 'File exceeds form limit',
            UPLOAD_ERR_PARTIAL    => 'File only partially uploaded',
            UPLOAD_ERR_NO_FILE    => 'No file uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'No temp directory',
            UPLOAD_ERR_CANT_WRITE => 'Cannot write file',
            UPLOAD_ERR_EXTENSION  => 'Upload blocked by extension',
        ];
        err($messages[$file['error']] ?? 'Upload error: ' . $file['error']);
    }

    // Validate file size
    if ($file['size'] > UPLOAD_MAX_SIZE) {
        err('File too large. Max 5MB allowed.');
    }

    // Validate MIME type via finfo (do not trust the client-sent type)
    $finfo    = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);

    if (!in_array($mimeType, ALLOWED_IMAGE_MIMES, true)) {
        err('Invalid file type. Only JPG, PNG, WebP and GIF are allowed.');
    }

    $ext       = IMAGE_EXT_MAP[$mimeType];
    $uploadDir = UPLOAD_DIR;

    // Ensure upload directory exists and is protected
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            err('Cannot create upload directory', 500);
        }
    }

    $htaccess = $uploadDir . '.htaccess';
    if (!file_exists($htaccess)) {
        file_put_contents(
            $htaccess,
            "Options -ExecCGI\nAddHandler cgi-script .php .pl .py .rb\nRemoveHandler .php\nOptions -Indexes\n"
        );
    }

    // Generate unique filename
    $filename = 'toro_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    $dest     = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        err('Failed to save file', 500);
    }

// Build URL — use configured base URL if available, otherwise derive from request
    if (defined('APP_BASE_URL') && APP_BASE_URL !== '') {
        $imageUrl = rtrim(APP_BASE_URL, '/') . '/uploads/' . $filename;
    } else {
        $scheme    = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        // Validate host header to prevent host injection attacks
        $host      = $_SERVER['HTTP_HOST'] ?? '';
        $host      = preg_replace('/[^a-zA-Z0-9.\-:]/', '', $host); // strip unsafe chars
        if ($host === '') $host = 'localhost';
        $scriptDir = dirname(dirname($_SERVER['SCRIPT_NAME'] ?? ''));
        $rootPath  = rtrim($scriptDir, '/');
        $imageUrl  = $scheme . '://' . $host . $rootPath . '/uploads/' . $filename;
    }

    return ['url' => $imageUrl, 'filename' => $filename];
}
