<?php
// upload.php — image upload endpoint (admin only)
require_once 'cors.php';
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    err('Method not allowed', 405);
}

authUser(true); // admin only

// Validate file presence
if (empty($_FILES['image'])) {
    err('No image file provided');
}

$file  = $_FILES['image'];
$error = $file['error'];

if ($error !== UPLOAD_ERR_OK) {
    $messages = [
        UPLOAD_ERR_INI_SIZE   => 'File exceeds server limit',
        UPLOAD_ERR_FORM_SIZE  => 'File exceeds form limit',
        UPLOAD_ERR_PARTIAL    => 'File only partially uploaded',
        UPLOAD_ERR_NO_FILE    => 'No file uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'No temp directory',
        UPLOAD_ERR_CANT_WRITE => 'Cannot write file',
        UPLOAD_ERR_EXTENSION  => 'Upload blocked by extension',
    ];
    err($messages[$error] ?? 'Upload error: ' . $error);
}

// Validate file size (max 5MB)
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    err('File too large. Max 5MB allowed.');
}

// Validate MIME type using finfo (not trusting client-sent type)
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);

$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($mimeType, $allowedMimes, true)) {
    err('Invalid file type. Only JPG, PNG, WebP and GIF are allowed.');
}

$extMap = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
];
$ext = $extMap[$mimeType];

// Build upload directory (one level above api/)
$uploadDir = dirname(__DIR__) . '/uploads/';
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        err('Cannot create upload directory', 500);
    }
}

// Protect directory from direct PHP execution
$htaccess = $uploadDir . '.htaccess';
if (!file_exists($htaccess)) {
    file_put_contents($htaccess, "Options -ExecCGI\nAddHandler cgi-script .php .pl .py .rb\nRemoveHandler .php\nOptions -Indexes\n");
}

// Generate a human-friendly unique filename with extra randomness to prevent collisions
$filename = 'toro_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
$dest     = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    err('Failed to save file', 500);
}

// Build the full URL to the uploaded image
$scheme   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host     = $_SERVER['HTTP_HOST'];
$baseUrl  = $scheme . '://' . $host;
// Detect root path: SCRIPT_NAME is e.g. /api/upload.php → root is two levels up
$scriptDir = dirname(dirname($_SERVER['SCRIPT_NAME'])); // e.g. '/' or '/myapp'
$rootPath  = rtrim($scriptDir, '/');                    // strip trailing slash
$imageUrl  = $baseUrl . $rootPath . '/uploads/' . $filename;

ok(['url' => $imageUrl, 'filename' => $filename]);
