using UnityEngine;
using System.Collections;

public class AlarmSystem : MonoBehaviour
{
    public static AlarmSystem Instance;

    [Header("Alarm Settings")]
    public AudioSource alarmAudioSource;
    public Light[] alarmLights;
    public GameObject[] corridorCreatures; // Koridorda spawn olacaklar

    [Header("Effects")]
    public Color alarmLightColor = Color.red;
    public float lightFlashSpeed = 0.5f;

    public bool IsAlarmActive { get; private set; }

    void Awake()
    {
        Instance = this;
    }

    void Start()
    {
        // Başlangıçta koridor yaratıklarını gizle
        foreach (var creature in corridorCreatures)
        {
            if (creature != null)
                creature.SetActive(false);
        }
    }

    public void TriggerAlarm()
    {
        if (IsAlarmActive) return;

        Debug.Log("[ALARM] ALARM AKTIF!");
        IsAlarmActive = true;

        // Ses başlat
        if (alarmAudioSource != null)
        {
            alarmAudioSource.Play();
        }

        // Işık efektleri
        StartCoroutine(AlarmLightEffect());

        // Koridor yaratıklarını aktifleştir
        StartCoroutine(SpawnCorridorCreatures());

        // Demo flow'a haber ver
        if (DemoFlowManager.Instance != null)
        {
            DemoFlowManager.Instance.OnAlarmTriggered();
        }
    }

    IEnumerator AlarmLightEffect()
    {
        // Normal ışıkları kapat
        Light[] allLights = FindObjectsOfType<Light>();
        foreach (var light in allLights)
        {
            if (!System.Array.Exists(alarmLights, element => element == light))
            {
                light.enabled = false;
            }
        }

        // Alarm ışıkları yanıp sönsün
        while (IsAlarmActive)
        {
            foreach (var light in alarmLights)
            {
                light.enabled = !light.enabled;
                light.color = alarmLightColor;
                light.intensity = 2f;
            }
            yield return new WaitForSeconds(lightFlashSpeed);
        }
    }

    IEnumerator SpawnCorridorCreatures()
    {
        yield return new WaitForSeconds(2f); // Biraz gecikme

        foreach (var creature in corridorCreatures)
        {
            if (creature != null)
            {
                creature.SetActive(true);
                Debug.Log($"[ALARM] Koridor yaratığı aktif: {creature.name}");
            }
        }
    }
}