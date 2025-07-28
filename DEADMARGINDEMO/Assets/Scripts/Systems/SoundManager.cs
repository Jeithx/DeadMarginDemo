using UnityEngine;
using System.Collections.Generic;

public class SoundManager : MonoBehaviour
{
    public static SoundManager Instance { get; private set; }

    //[Header("Sound Detection Rules (from GDD)")]
    //private float[] soundThresholds = { 10f, 30f, 50f, 70f, 90f };
    //private float[] detectionRanges = { 5f, 10f, 20f, 30f, 50f };

    [Header("Sound Detection Rules (from GDD)")]
    [SerializeField] private float minAudibleDecibel = 10f; // bunun altı asla duyulmaz
    // Eşikler: "db < threshold[i]" mantığıyla çalışacak. Artan sıralı olmalı!
    [SerializeField] private float[] soundThresholds = { 30f, 50f, 70f, 90f };
    // Her eşik bandı için karşılık gelen menziller (aynı uzunlukta olmalı)
    [SerializeField] private float[] detectionRanges = { 5f, 10f, 20f, 30f };
    // En yüksek bandın üstü için maksimum menzil:
    [SerializeField] private float maxRangeAboveHighest = 50f;


    [Header("Debug")]
    public bool showDebugGizmos = true;
    public float gizmoDisplayDuration = 1f;

    private List<CreatureAI> allCreatures = new List<CreatureAI>();

    private List<SoundEvent> recentSounds = new List<SoundEvent>();

    private class SoundEvent
    {
        public Vector3 position;
        public float decibel;
        public float timestamp;

        public SoundEvent(Vector3 pos, float db)
        {
            position = pos;
            decibel = db;
            timestamp = Time.time;
        }
    }

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
            return;
        }
    }

    void Start()
    {
        RefreshCreatureList();
    }

    // dB değerinin düştüğü bandın menzilini verir.
    // minAudibleDecibel'in altı -> 0 (duyulmaz)
    private float ResolveHearingRange(float decibel)
    {
        if (decibel < minAudibleDecibel)
            return 0f;

        // thresholds ve ranges uzunluk kontrolü
        if (detectionRanges == null || soundThresholds == null || detectionRanges.Length != soundThresholds.Length)
        {
            Debug.LogWarning("[SOUND MANAGER] thresholds/ranges uzunlukları uyuşmuyor. Varsayılan 0 döndü.");
            return 0f;
        }

        // thresholds artan sırada olmalı
        for (int i = 0; i < soundThresholds.Length; i++)
        {
            if (decibel < soundThresholds[i])
                return detectionRanges[i];
        }

        // en yüksek eşiğin üzeri
        return maxRangeAboveHighest;
    }

    // Eski public API ile uyum için bırakıyoruz:
    public float GetMaxHearingDistance(float decibel)
    {
        return ResolveHearingRange(decibel);
    }

    public void RefreshCreatureList()
    {
        allCreatures.Clear();
        CreatureAI[] creatures = FindObjectsOfType<CreatureAI>();
        allCreatures.AddRange(creatures);
        Debug.Log($"[SOUND MANAGER] {allCreatures.Count} yaratık bulundu.");
    }

    public void RegisterSound(Vector3 soundPosition, float decibel)
    {
        recentSounds.Add(new SoundEvent(soundPosition, decibel));
        if (recentSounds.Count > 16) recentSounds.RemoveAt(0); // hafifçe artırdım

        Debug.Log($"[SOUND MANAGER] Ses algılandı: {decibel} dB - Pozisyon: {soundPosition}");

        foreach (CreatureAI creature in allCreatures)
        {
            if (creature == null) continue;

            if (CanCreatureHearSound(soundPosition, creature.transform.position, decibel))
            {
                float distance = Vector3.Distance(soundPosition, creature.transform.position); // log için
                creature.OnSoundHeard(soundPosition, decibel, distance);
                Debug.Log($"[SOUND MANAGER] Yaratık sesi duydu! Mesafe: {distance:F1} m, Ses: {decibel} dB");
            }
        }
    }

    bool CanCreatureHearSound(Vector3 soundPos, Vector3 creaturePos, float decibel)
    {
        float maxRange = ResolveHearingRange(decibel);
        if (maxRange <= 0f) return false;

        float maxRangeSqr = maxRange * maxRange;
        float distSqr = (soundPos - creaturePos).sqrMagnitude;

        return distSqr <= maxRangeSqr;
    }

    void OnDrawGizmos()
    {
        if (!showDebugGizmos) return;

        foreach (SoundEvent sound in recentSounds)
        {
            float age = Time.time - sound.timestamp;
            if (age > gizmoDisplayDuration) continue;

            Color gizmoColor = Color.green;
            if (sound.decibel > 30) gizmoColor = Color.yellow;
            if (sound.decibel > 50) gizmoColor = Color.red;

            gizmoColor.a = 1f - (age / gizmoDisplayDuration);
            Gizmos.color = gizmoColor;

            Gizmos.DrawWireSphere(sound.position, 0.5f);

            float maxRange = GetMaxHearingDistance(sound.decibel);
            Gizmos.DrawWireSphere(sound.position, maxRange);
        }
    }

    public void RegisterCreature(CreatureAI creature)
    {
        if (!allCreatures.Contains(creature))
        {
            allCreatures.Add(creature);
        }
    }

    public void UnregisterCreature(CreatureAI creature)
    {
        allCreatures.Remove(creature);
    }
}