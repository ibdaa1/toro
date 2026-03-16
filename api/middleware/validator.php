<?php
// ─────────────────────────────────────────────────────────────
// middleware/validator.php — Input validation middleware
// ─────────────────────────────────────────────────────────────

class Validator {
    private $data;
    private $errors = [];
    private $lang;

    public function __construct($data, $lang = 'ar') {
        $this->data = $data;
        $this->lang = $lang;
    }

    /** Fluent factory */
    public static function make($data, $lang = 'ar') {
        return new self($data, $lang);
    }

    /** Check required string fields */
    public function required($field, $label = '') {
        $val = trim((string)(isset($this->data[$field]) ? $this->data[$field] : ''));
        if ($val === '') {
            $this->errors[$field] = ($label ? $label : $field) . ($this->lang === 'ar' ? ' مطلوب' : ' is required');
        }
        return $this;
    }

    /** Validate email */
    public function email($field) {
        $val = trim((string)(isset($this->data[$field]) ? $this->data[$field] : ''));
        if ($val !== '' && !filter_var($val, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = $this->lang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
        }
        return $this;
    }

    /** Validate string max length */
    public function maxLen($field, $max) {
        $val = (string)(isset($this->data[$field]) ? $this->data[$field] : '');
        if (mb_strlen($val) > $max) {
            $this->errors[$field] = $this->lang === 'ar'
                ? "الحقل طويل جداً (الحد الأقصى $max حرف)"
                : "Field too long (max $max characters)";
        }
        return $this;
    }

    /** Validate minimum string length */
    public function minLen($field, $min) {
        $val = (string)(isset($this->data[$field]) ? $this->data[$field] : '');
        if (mb_strlen(trim($val)) < $min) {
            $this->errors[$field] = $this->lang === 'ar'
                ? "الحقل قصير جداً (الحد الأدنى $min أحرف)"
                : "Field too short (min $min characters)";
        }
        return $this;
    }

    /** Validate numeric range */
    public function numericMin($field, $min) {
        $val = (float)(isset($this->data[$field]) ? $this->data[$field] : 0);
        if ($val < $min) {
            $this->errors[$field] = $this->lang === 'ar'
                ? "القيمة يجب أن تكون $min على الأقل"
                : "Value must be at least $min";
        }
        return $this;
    }

    /** Validate value is in a list of allowed values */
    public function inList($field, $allowed) {
        $val = isset($this->data[$field]) ? $this->data[$field] : '';
        if ($val !== '' && !in_array($val, $allowed, true)) {
            $this->errors[$field] = $this->lang === 'ar'
                ? 'قيمة غير مسموح بها'
                : 'Value not allowed';
        }
        return $this;
    }

    /** Return validation errors */
    public function errors() {
        return $this->errors;
    }

    /** Return true if there are no errors */
    public function passes() {
        return empty($this->errors);
    }

    /**
     * Terminate with a 400 JSON error if validation fails.
     */
    public function failOrPass() {
        if (!$this->passes()) {
            http_response_code(400);
            echo json_encode([
                'ok'     => false,
                'msg'    => $this->lang === 'ar' ? 'خطأ في البيانات المدخلة' : 'Validation error',
                'errors' => $this->errors,
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}
