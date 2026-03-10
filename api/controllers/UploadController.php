<?php
// ─────────────────────────────────────────────────────────────
// controllers/UploadController.php
// POST /upload.php  — upload an image (admin only)
// DELETE /upload.php — delete an uploaded image (admin only)
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../helpers/auth_helper.php';
require_once __DIR__ . '/../helpers/upload.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/config.php';

class UploadController {
    public function handle() {
        $method = reqMethod();

        if ($method === 'POST') {
            authUser(true);
            if (empty($_FILES['image'])) err('No image file provided');
            $result = processImageUpload($_FILES['image']);
            ok($result);
        } elseif ($method === 'DELETE') {
            authUser(true);
            $body = json_decode(file_get_contents('php://input'), true);
            $url  = trim($body['url'] ?? '');
            if ($url === '') err('No URL provided');

            // Only allow deletion of files in our own uploads directory
            $filename  = basename(parse_url($url, PHP_URL_PATH));
            $uploadDir = UPLOAD_DIR;
            $filePath  = $uploadDir . $filename;

            // Security: reject path traversal or files outside uploads/
            if ($filename === '') {
                err('Invalid filename');
            }
            $realDir  = realpath($uploadDir);
            $filePath = $uploadDir . $filename;
            $realFile = realpath($filePath);
            if ($realDir === false || $realFile === false || strpos($realFile, $realDir . DIRECTORY_SEPARATOR) !== 0) {
                // File doesn't exist or is outside uploads dir — treat as success (idempotent)
                ok(['deleted' => false, 'reason' => 'not_found']);
            }

            if (!unlink($realFile)) {
                err('Failed to delete file', 500);
            }
            ok(['deleted' => true, 'filename' => $filename]);
        } else {
            err('Method not allowed', 405);
        }
    }
}
