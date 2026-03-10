<?php
// ─────────────────────────────────────────────────────────────
// controllers/UploadController.php
// Handles POST /upload.php (admin only)
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../helpers/auth_helper.php';
require_once __DIR__ . '/../helpers/upload.php';
require_once __DIR__ . '/../helpers/response.php';

class UploadController {
    public function handle() {
        if (reqMethod() !== 'POST') err('Method not allowed', 405);
        authUser(true);

        if (empty($_FILES['image'])) err('No image file provided');

        $result = processImageUpload($_FILES['image']);
        ok($result);
    }
}
