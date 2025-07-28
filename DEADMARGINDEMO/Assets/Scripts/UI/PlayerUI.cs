using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;
using System.Linq;

public class PlayerUI : MonoBehaviour
{
    [Header("UI Elements")]
    public Text healthText;
    public Text soundLevelText;
    public Text movementStateText;
    public Text weaponText;
    public Text nearbyCreatureText;
    public Text debugInfoText;

    [Header("UI Panels")]
    public GameObject hudPanel;
    public GameObject debugPanel;

    [Header("References")]
    private PlayerController playerController;
    private WeaponSystem weaponSystem;

    [Header("Settings")]
    public float creatureDetectionRange = 20f;
    public bool showDebugInfo = true;

    // Internal
    private Canvas uiCanvas;
    private List<CreatureAI> nearbyCreatures = new List<CreatureAI>();

    void Start()
    {
        // Create UI if not exists
        if (hudPanel == null)
        {
            CreateUI();
        }

        // Get references
        playerController = FindObjectOfType<PlayerController>();
        weaponSystem = playerController?.GetComponent<WeaponSystem>();

        // Toggle debug with F3
        if (debugPanel != null)
        {
            debugPanel.SetActive(showDebugInfo);
        }
    }

    void Update()
    {
        UpdateHealthDisplay();
        UpdateSoundDisplay();
        UpdateMovementDisplay();
        UpdateWeaponDisplay();
        UpdateCreatureDisplay();
        UpdateDebugInfo();

        // Toggle debug panel
        if (Input.GetKeyDown(KeyCode.F3))
        {
            showDebugInfo = !showDebugInfo;
            if (debugPanel != null)
            {
                debugPanel.SetActive(showDebugInfo);
            }
        }
    }

    void CreateUI()
    {
        // Create Canvas
        GameObject canvasObj = new GameObject("PlayerUI");
        uiCanvas = canvasObj.AddComponent<Canvas>();
        uiCanvas.renderMode = RenderMode.ScreenSpaceOverlay;
        canvasObj.AddComponent<CanvasScaler>();
        canvasObj.AddComponent<GraphicRaycaster>();

        // HUD Panel
        hudPanel = CreatePanel("HUD Panel", new Vector2(200, 150),
                               new Vector2(10, -10), TextAnchor.UpperLeft);

        // Debug Panel
        debugPanel = CreatePanel("Debug Panel", new Vector2(300, 200),
                                new Vector2(-10, -10), TextAnchor.UpperRight);

        // HUD Texts
        healthText = CreateText("Health", hudPanel.transform, new Vector2(0, 0));
        soundLevelText = CreateText("Sound", hudPanel.transform, new Vector2(0, -30));
        movementStateText = CreateText("Movement", hudPanel.transform, new Vector2(0, -60));
        weaponText = CreateText("Weapon", hudPanel.transform, new Vector2(0, -90));
        nearbyCreatureText = CreateText("Creatures", hudPanel.transform, new Vector2(0, -120));

        // Debug Text
        debugInfoText = CreateText("Debug Info", debugPanel.transform, new Vector2(10, -10));
        debugInfoText.alignment = TextAnchor.UpperLeft;

        // Crosshair
        CreateCrosshair();
    }

    GameObject CreatePanel(string name, Vector2 size, Vector2 position, TextAnchor alignment)
    {
        GameObject panel = new GameObject(name);
        panel.transform.SetParent(uiCanvas.transform);

        RectTransform rect = panel.AddComponent<RectTransform>();
        rect.sizeDelta = size;

        // Position based on alignment
        switch (alignment)
        {
            case TextAnchor.UpperLeft:
                rect.anchorMin = new Vector2(0, 1);
                rect.anchorMax = new Vector2(0, 1);
                rect.pivot = new Vector2(0, 1);
                break;
            case TextAnchor.UpperRight:
                rect.anchorMin = new Vector2(1, 1);
                rect.anchorMax = new Vector2(1, 1);
                rect.pivot = new Vector2(1, 1);
                break;
        }

        rect.anchoredPosition = position;

        // Background
        Image bg = panel.AddComponent<Image>();
        bg.color = new Color(0, 0, 0, 0.7f);

        return panel;
    }

    Text CreateText(string name, Transform parent, Vector2 position)
    {
        GameObject textObj = new GameObject(name);
        textObj.transform.SetParent(parent);

        RectTransform rect = textObj.AddComponent<RectTransform>();
        rect.sizeDelta = new Vector2(180, 30);
        rect.anchorMin = new Vector2(0, 1);
        rect.anchorMax = new Vector2(0, 1);
        rect.pivot = new Vector2(0, 1);
        rect.anchoredPosition = position;

        Text text = textObj.AddComponent<Text>();
        text.font = Font.CreateDynamicFontFromOSFont("Arial", 14);
        text.color = Color.white;
        text.alignment = TextAnchor.MiddleLeft;

        // Padding
        rect.offsetMin = new Vector2(10, rect.offsetMin.y);

        return text;
    }

    void CreateCrosshair()
    {
        GameObject crosshair = new GameObject("Crosshair");
        crosshair.transform.SetParent(uiCanvas.transform);

        RectTransform rect = crosshair.AddComponent<RectTransform>();
        rect.sizeDelta = new Vector2(20, 20);
        rect.anchorMin = new Vector2(0.5f, 0.5f);
        rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = Vector2.zero;

        Text crosshairText = crosshair.AddComponent<Text>();
        crosshairText.text = "+";
        crosshairText.font = Font.CreateDynamicFontFromOSFont("Arial", 24);
        crosshairText.color = Color.white;
        crosshairText.alignment = TextAnchor.MiddleCenter;
    }

    void UpdateHealthDisplay()
    {
        if (playerController != null && healthText != null)
        {
            float current = playerController.GetCurrentHealth();
            float max = playerController.GetMaxHealth();
            healthText.text = $"Can: {current:F0}/{max:F0}";

            // Renk değiştir
            if (current < max * 0.3f)
                healthText.color = Color.red;
            else if (current < max * 0.6f)
                healthText.color = Color.yellow;
            else
                healthText.color = Color.green;
        }
    }

    void UpdateSoundDisplay()
    {
        if (playerController != null && soundLevelText != null)
        {
            float sound = playerController.GetCurrentSoundLevel();
            soundLevelText.text = $"Ses: {sound:F0} dB";

            // Renk
            if (sound > 50)
                soundLevelText.color = Color.red;
            else if (sound > 30)
                soundLevelText.color = Color.yellow;
            else
                soundLevelText.color = Color.green;
        }
    }

    void UpdateMovementDisplay()
    {
        if (playerController != null && movementStateText != null)
        {
            string state = playerController.GetMovementState();
            movementStateText.text = $"Hareket: {state}";
        }
    }

    void UpdateWeaponDisplay()
    {
        if (weaponSystem != null && weaponText != null)
        {
            weaponText.text = $"Silah: {weaponSystem.currentWeapon}";
        }
    }

    void UpdateCreatureDisplay()
    {
        if (nearbyCreatureText == null) return;

        // Find nearby creatures
        nearbyCreatures = FindObjectsOfType<CreatureAI>()
            .Where(c => Vector3.Distance(transform.position, c.transform.position) <= creatureDetectionRange)
            .OrderBy(c => Vector3.Distance(transform.position, c.transform.position))
            .ToList();

        if (nearbyCreatures.Count > 0)
        {
            CreatureAI closest = nearbyCreatures[0];
            float distance = Vector3.Distance(transform.position, closest.transform.position);
            nearbyCreatureText.text = $"Yaratık: {closest.currentState} ({distance:F1}m)";

            // Renk
            switch (closest.currentState)
            {
                case CreatureAI.CreatureState.Passive:
                    nearbyCreatureText.color = Color.green;
                    break;
                case CreatureAI.CreatureState.Suspicious:
                    nearbyCreatureText.color = Color.yellow;
                    break;
                case CreatureAI.CreatureState.Alert:
                    nearbyCreatureText.color = Color.red;
                    break;
            }
        }
        else
        {
            nearbyCreatureText.text = "Yaratık: Yok";
            nearbyCreatureText.color = Color.gray;
        }
    }

    void UpdateDebugInfo()
    {
        if (!showDebugInfo || debugInfoText == null) return;

        string debug = "=== DEBUG INFO ===\n";
        debug += $"FPS: {(1f / Time.deltaTime):F0}\n";
        debug += $"Pozisyon: {transform.position}\n";

        if (nearbyCreatures.Count > 0)
        {
            debug += $"\nYakın Yaratıklar ({nearbyCreatures.Count}):\n";
            foreach (var creature in nearbyCreatures.Take(3))
            {
                float dist = Vector3.Distance(transform.position, creature.transform.position);
                debug += $"- {creature.currentState} ({dist:F1}m)\n";
            }
        }

        debugInfoText.text = debug;
    }
}