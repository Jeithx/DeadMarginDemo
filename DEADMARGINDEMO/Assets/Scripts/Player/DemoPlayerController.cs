using UnityEngine;
using UnityEngine.UI;

public class DemoPlayerController : MonoBehaviour
{
    [Header("Demo Specific")]
    public float knifeRange = 1.5f;
    public float knifeDelay = 0.5f;
    public LayerMask creatureLayer;

    [Header("UI")]
    public Text objectiveText;
    public GameObject knifeIcon;
    public GameObject flashlightIcon;

    // Components
    private PlayerController playerController;
    private Camera playerCamera;

    // State
    private bool hasKnife = false;
    private bool hasFlashlight = false;
    private float lastKnifeTime = 0f;

    void Start()
    {
        playerController = GetComponent<PlayerController>();
        playerCamera = GetComponentInChildren<Camera>();

        // UI başlangıç
        if (knifeIcon) knifeIcon.SetActive(false);
        if (flashlightIcon) flashlightIcon.SetActive(false);

        UpdateObjective("Sessizce ilerle. Sağdaki odayı kontrol et.");
    }

    void Update()
    {
        // Bıçak saldırısı
        if (hasKnife && Input.GetMouseButtonDown(0))
        {
            if (Time.time - lastKnifeTime > knifeDelay)
            {
                TryKnifeAttack();
                lastKnifeTime = Time.time;
            }
        }
    }

    void TryKnifeAttack()
    {
        Debug.Log("[DEMO] Bıçak saldırısı!");

        RaycastHit hit;
        Ray ray = new Ray(playerCamera.transform.position, playerCamera.transform.forward);

        if (Physics.Raycast(ray, out hit, knifeRange, creatureLayer))
        {
            Debug.Log($"[DEMO] Hedefe isabet: {hit.transform.name}");

            // Arkadan mı vuruyoruz?
            Vector3 toCreature = hit.transform.position - transform.position;
            float angle = Vector3.Angle(hit.transform.forward, -toCreature);

            if (angle < 60f) // Arkadan
            {
                var creature = hit.transform.GetComponent<CreatureAI>();
                if (creature != null)
                {
                    creature.TakeDamage(100f); // Tek vuruşta öldür
                    UpdateObjective("Mükemmel! Şimdi soldaki odaya git.");

                    // Demo flow manager'a haber ver
                    if (DemoFlowManager.Instance != null)
                    {
                        DemoFlowManager.Instance.OnCreature1Killed();
                    }
                }
            }
            else
            {
                Debug.Log("[DEMO] Önden saldırı - etkisiz!");
            }
        }
    }

    public void PickupKnife()
    {
        hasKnife = true;
        if (knifeIcon) knifeIcon.SetActive(true);
        UpdateObjective("Bıçak alındı! Yaratığın arkasından yaklaş ve Sol Tık ile öldür.");
    }

    public void PickupFlashlight()
    {
        hasFlashlight = true;
        if (flashlightIcon) flashlightIcon.SetActive(true);

        // Flashlight component'i aktifleştir
        var flashlight = GetComponentInChildren<Light>(true);
        if (flashlight != null)
        {
            flashlight.gameObject.SetActive(true);
        }

        UpdateObjective("El feneri alındı! Alarm butonuna bas.");
    }

    void UpdateObjective(string text)
    {
        if (objectiveText != null)
        {
            objectiveText.text = text;
        }
        Debug.Log($"[OBJECTIVE] {text}");
    }
}