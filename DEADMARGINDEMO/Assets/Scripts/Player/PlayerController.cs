using UnityEngine;

public class PlayerController : MonoBehaviour
{
    [Header("Movement Settings")]
    public float walkSpeed = 5f;
    public float runSpeed = 10f;
    public float crouchSpeed = 2f;
    public float jumpForce = 5f;

    [Header("Sound Values (dB)")]
    private float walkSound = 20f;      
    private float runSound = 40f;       
    private float crouchSound = 10f;    

    [Header("Health System")]
    public float maxHealth = 100f;
    private float currentHealth;

    [Header("Components")]
    private Rigidbody rb;
    private Camera playerCamera;

    // Movement states
    public enum MovementState { Idle, Walking, Running, Crouching }
    public MovementState currentMovementState = MovementState.Idle;

    // Internal variables
    private float currentSpeed;
    private float currentSoundLevel = 0f;
    private float lastSoundEmitTime = 0f;
    private float soundEmitInterval = 0.5f;

    // Input variables
    private float horizontalInput;
    private float verticalInput;
    private bool isRunning;
    private bool isCrouching;
    private void Awake()
    {
        // Kamera yoksa oluştur
        if (playerCamera == null)
        {
            GameObject camObj = new GameObject("PlayerCamera");
            camObj.transform.SetParent(transform);
            camObj.transform.localPosition = new Vector3(0, 0.5f, 0);
            playerCamera = camObj.AddComponent<Camera>();
            playerCamera.tag = "MainCamera";
        }

    }
    void Start()
    {
        rb = GetComponent<Rigidbody>();
        currentHealth = maxHealth;

       
        // Mouse kilitle
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
    }

    void Update()
    {
        //IF R IS PRESSED THEN RELOAD THE SCENE 
        if (Input.GetKeyDown(KeyCode.R))
        {
            UnityEngine.SceneManagement.SceneManager.LoadScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene().name);
        }
        HandleInput();
        HandleMovementState();
        HandleSound();
        HandleMouseLook();
    }

    void FixedUpdate()
    {
        HandleMovement();
    }

    void HandleInput()
    {
        horizontalInput = Input.GetAxis("Horizontal");
        verticalInput = Input.GetAxis("Vertical");

        isRunning = Input.GetKey(KeyCode.LeftShift);

        isCrouching = Input.GetKey(KeyCode.LeftControl);
    }

    void HandleMovementState()
    {
        bool isMoving = Mathf.Abs(horizontalInput) > 0.1f || Mathf.Abs(verticalInput) > 0.1f;

        if (!isMoving)
        {
            currentMovementState = MovementState.Idle;
            currentSpeed = 0;
            currentSoundLevel = 0;
        }
        else if (isCrouching)
        {
            currentMovementState = MovementState.Crouching;
            currentSpeed = crouchSpeed;
            currentSoundLevel = crouchSound;
        }
        else if (isRunning)
        {
            currentMovementState = MovementState.Running;
            currentSpeed = runSpeed;
            currentSoundLevel = runSound;
        }
        else
        {
            currentMovementState = MovementState.Walking;
            currentSpeed = walkSpeed;
            currentSoundLevel = walkSound;
        }


        if (isCrouching)
        {
            transform.localScale = new Vector3(1, 0.5f, 1);
        }
        else
        {
            transform.localScale = new Vector3(1, 1, 1);
        }
    }

    void HandleMovement()
    {
        Vector3 moveDirection = transform.forward * verticalInput + transform.right * horizontalInput;
        moveDirection.Normalize();

        rb.MovePosition(rb.position + moveDirection * currentSpeed * Time.fixedDeltaTime);
    }

    void HandleSound()
    {

        if (currentMovementState != MovementState.Idle && Time.time - lastSoundEmitTime > soundEmitInterval)
        {
            EmitSound(currentSoundLevel);
            lastSoundEmitTime = Time.time;
        }
    }

    void HandleMouseLook()
    {
        float mouseX = Input.GetAxis("Mouse X") * 2f;
        transform.Rotate(Vector3.up * mouseX);
    }

    public void EmitSound(float decibel)
    {

        if (SoundManager.Instance != null)
        {
            SoundManager.Instance.RegisterSound(transform.position, decibel);
        }

        // Debug
        Debug.Log($"[PLAYER] Ses yayıldı: {decibel} dB - Durum: {currentMovementState}");
    }

    public void TakeDamage(float damage)
    {
        currentHealth -= damage;
        Debug.Log($"[PLAYER] Hasar alındı! Can: {currentHealth}/{maxHealth}");

        if (currentHealth <= 0)
        {
            Die();
        }
    }

    void Die()
    {
        Debug.Log("[PLAYER] Öldün!");
    }

    public float GetCurrentHealth() { return currentHealth; }
    public float GetMaxHealth() { return maxHealth; }
    public float GetCurrentSoundLevel() { return currentSoundLevel; }
    public string GetMovementState() { return currentMovementState.ToString(); }
}