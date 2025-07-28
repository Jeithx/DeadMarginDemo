using UnityEngine;
using UnityEngine.AI;

public class CreatureAI : MonoBehaviour
{
    public enum CreatureState { Passive, Suspicious, Alert }
    public CreatureState currentState = CreatureState.Passive;
    private CreatureState previousState = CreatureState.Passive;

    [Header("AI Settings")]
    public float passiveSpeed = 0f;
    public float suspiciousSpeed = 2f;
    public float alertSpeed = 5f;
    public float attackDamage = 10f;
    public float attackRange = 2f;
    public float attackCooldown = 1f;

    [Header("Detection Settings")]
    public float sightRange = 15f;
    public float fieldOfView = 90f;
    public LayerMask sightBlockingLayers;

    [Header("State Timers")]
    public float suspiciousDuration = 10f;
    public float alertDuration = 20f;
    private float stateTimer = 0f;

    [Header("Health")]
    public float maxHealth = 100f;
    private float currentHealth;

    [Header("Components")]
    private NavMeshAgent agent;
    private Renderer creatureRenderer;
    private Transform player;

    // Internal variables
    private Vector3 lastSoundPosition;
    private float lastSoundTime;
    private float lastAttackTime;
    private bool isInvestigating = false;
    private Vector3 originalPosition;

    // Colors for states
    private Color passiveColor = Color.green;
    private Color suspiciousColor = Color.yellow;
    private Color alertColor = Color.red;

    void Start()
    {
        // Component setup
        SetupComponents();

        // Health
        currentHealth = maxHealth;

        // Save original position
        originalPosition = transform.position;

        // Register to SoundManager
        if (SoundManager.Instance != null)
        {
            SoundManager.Instance.RegisterCreature(this);
        }

        // Initial state
        ChangeState(CreatureState.Passive);
    }

    void SetupComponents()
    {
        // NavMeshAgent ekle/bul
        agent = GetComponent<NavMeshAgent>();
        if (agent == null)
        {
            agent = gameObject.AddComponent<NavMeshAgent>();
        }

        // Renderer
        creatureRenderer = GetComponent<Renderer>();

        // Player'ı bul
        GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
        if (playerObj != null)
        {
            player = playerObj.transform;
        }

        // NavMesh ayarları
        agent.speed = passiveSpeed;
        agent.stoppingDistance = 1.5f;
    }

    void Update()
    {
        UpdateStateBehavior();
        UpdateStateTimer();
        CheckPlayerVisibility();

        // Debug info
        if (Input.GetKeyDown(KeyCode.F1))
        {
            Debug.Log($"[CREATURE] State: {currentState}, Timer: {stateTimer:F1}");
        }
    }

    void UpdateStateBehavior()
    {
        switch (currentState)
        {
            case CreatureState.Passive:
                PassiveBehavior();
                break;
            case CreatureState.Suspicious:
                SuspiciousBehavior();
                break;
            case CreatureState.Alert:
                AlertBehavior();
                break;
        }
    }

    void PassiveBehavior()
    {
        // Yerinde dur veya patrol yap
        agent.speed = passiveSpeed;

        // Eğer orijinal pozisyondan uzaksa geri dön
        if (Vector3.Distance(transform.position, originalPosition) > 1f)
        {
            agent.SetDestination(originalPosition);
        }
    }

    void SuspiciousBehavior()
    {
        agent.speed = suspiciousSpeed;

        // Son ses pozisyonuna doğru araştır
        if (isInvestigating && lastSoundPosition != Vector3.zero)
        {
            agent.SetDestination(lastSoundPosition);

            // Hedefe yaklaştıysa
            if (Vector3.Distance(transform.position, lastSoundPosition) < 2f)
            {
                isInvestigating = false;
                Debug.Log("[CREATURE] Ses kaynağına ulaştı, etrafı araştırıyor...");
            }
        }

        // Etrafına bakın
        transform.Rotate(Vector3.up * 30f * Time.deltaTime);
    }

    void AlertBehavior()
    {
        agent.speed = alertSpeed;

        if (player != null)
        {
            // Oyuncuyu takip et
            agent.SetDestination(player.position);

            // Saldırı menzilinde mi?
            float distanceToPlayer = Vector3.Distance(transform.position, player.position);
            if (distanceToPlayer <= attackRange && Time.time - lastAttackTime >= attackCooldown)
            {
                AttackPlayer();
            }
        }
    }

    void UpdateStateTimer()
    {
        if (currentState != CreatureState.Passive)
        {
            stateTimer -= Time.deltaTime;

            if (stateTimer <= 0)
            {
                // Bir seviye düşür
                if (currentState == CreatureState.Alert)
                {
                    ChangeState(CreatureState.Suspicious);
                }
                else if (currentState == CreatureState.Suspicious)
                {
                    ChangeState(CreatureState.Passive);
                }
            }
        }
    }

    void CheckPlayerVisibility()
    {
        if (player == null || currentState == CreatureState.Alert) return;

        float distanceToPlayer = Vector3.Distance(transform.position, player.position);

        // Görüş menzilinde mi?
        if (distanceToPlayer <= sightRange)
        {
            // Görüş açısında mı?
            Vector3 directionToPlayer = (player.position - transform.position).normalized;
            float angle = Vector3.Angle(transform.forward, directionToPlayer);

            if (angle <= fieldOfView / 2f)
            {
                // Line of sight var mı?
                RaycastHit hit;
                if (Physics.Raycast(transform.position + Vector3.up, directionToPlayer, out hit, sightRange))
                {
                    if (hit.transform == player)
                    {
                        Debug.Log("[CREATURE] Oyuncu görüldü!");
                        ChangeState(CreatureState.Alert);
                    }
                }
            }
        }
    }

    public void OnSoundHeard(Vector3 soundPosition, float decibel, float distance)
    {
        Debug.Log($"[CREATURE] Ses duyuldu! {decibel} dB, {distance:F1}m uzaklıkta");

        lastSoundPosition = soundPosition;
        lastSoundTime = Time.time;

        // GDD'ye göre state değişimi
        // 10-30 dB: Tepki yok
        // 31-50 dB: Suspicious
        // 51+ dB: Alert

        if (decibel >= 31 && decibel <= 50)
        {
            if (currentState == CreatureState.Passive)
            {
                ChangeState(CreatureState.Suspicious);
                isInvestigating = true;
            }
        }
        else if (decibel >= 51)
        {
            ChangeState(CreatureState.Alert);
            isInvestigating = false;
        }

        // Sese doğru bak
        Vector3 lookDirection = soundPosition - transform.position;
        lookDirection.y = 0;
        if (lookDirection != Vector3.zero)
        {
            transform.rotation = Quaternion.LookRotation(lookDirection);
        }
    }

    void ChangeState(CreatureState newState)
    {
        if (currentState == newState) return;

        previousState = currentState;
        currentState = newState;

        Debug.Log($"[CREATURE] Durum değişti: {previousState} -> {currentState}");

        // Timer'ı sıfırla
        switch (newState)
        {
            case CreatureState.Suspicious:
                stateTimer = suspiciousDuration;
                break;
            case CreatureState.Alert:
                stateTimer = alertDuration;
                break;
        }

        // Görsel güncelle
        UpdateVisualState();
    }

    void UpdateVisualState()
    {
        if (creatureRenderer == null) return;

        switch (currentState)
        {
            case CreatureState.Passive:
                creatureRenderer.material.color = passiveColor;
                break;
            case CreatureState.Suspicious:
                creatureRenderer.material.color = suspiciousColor;
                break;
            case CreatureState.Alert:
                creatureRenderer.material.color = alertColor;
                break;
        }
    }

    void AttackPlayer()
    {
        Debug.Log("[CREATURE] Oyuncuya saldırıyor!");

        PlayerController playerController = player.GetComponent<PlayerController>();
        if (playerController != null)
        {
            playerController.TakeDamage(attackDamage);
            lastAttackTime = Time.time;
        }
    }

    public void TakeDamage(float damage)
    {
        currentHealth -= damage;
        Debug.Log($"[CREATURE] Hasar aldı! Can: {currentHealth}/{maxHealth}");

        // Hasar alınca kesinlikle Alert ol
        ChangeState(CreatureState.Alert);

        if (currentHealth <= 0)
        {
            Die();
        }
    }

    void Die()
    {
        Debug.Log("[CREATURE] Öldü!");

        // SoundManager'dan çıkar
        if (SoundManager.Instance != null)
        {
            SoundManager.Instance.UnregisterCreature(this);
        }

        // Objeyi yok et
        Destroy(gameObject);
    }

    void OnDestroy()
    {
        // Cleanup
        if (SoundManager.Instance != null)
        {
            SoundManager.Instance.UnregisterCreature(this);
        }
    }
}