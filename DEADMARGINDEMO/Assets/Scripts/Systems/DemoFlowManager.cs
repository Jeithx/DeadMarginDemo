using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class DemoFlowManager : MonoBehaviour
{
    public static DemoFlowManager Instance;

    [Header("UI Elements")]
    public Text objectiveText;
    public Text timerText;
    public GameObject victoryScreen;
    public GameObject deathScreen;

    [Header("Game Elements")]
    public GameObject exitDoor;
    public Transform playerSpawn;

    [Header("Audio")]
    public AudioSource musicSource;
    public AudioClip calmMusic;
    public AudioClip panicMusic;

    private float startTime;
    private bool isCompleted = false;
    private DemoPhase currentPhase = DemoPhase.Introduction;

    public enum DemoPhase
    {
        Introduction,
        StealthPhase,
        AlarmPhase,
        Escape
    }

    void Awake()
    {
        Instance = this;
    }

    void Start()
    {
        startTime = Time.time;

        // Müzik başlat
        if (musicSource && calmMusic)
        {
            musicSource.clip = calmMusic;
            musicSource.Play();
        }

        StartCoroutine(IntroSequence());
    }

    void Update()
    {
        // Timer güncelle
        if (!isCompleted && timerText != null)
        {
            float elapsed = Time.time - startTime;
            timerText.text = $"Süre: {elapsed:F1}s";
        }
    }

    IEnumerator IntroSequence()
    {
        ShowObjective("Sessizce ilerle. Koşma veya yüksek ses çıkarma.");
        yield return new WaitForSeconds(3f);
        ShowObjective("Sağdaki ilk odayı kontrol et.");
    }

    public void OnCreature1Killed()
    {
        currentPhase = DemoPhase.StealthPhase;
        ShowObjective("Mükemmel! Şimdi soldaki odaya git.");
    }

    public void OnAlarmTriggered()
    {
        currentPhase = DemoPhase.AlarmPhase;
        ShowObjective("ALARM! HEMEN ÇIKIŞ KAPISINA KOŞ!");

        // Panik müziğe geç
        if (musicSource && panicMusic)
        {
            musicSource.clip = panicMusic;
            musicSource.Play();
        }

        // Çıkış kapısını yeşil yap
        if (exitDoor != null)
        {
            exitDoor.GetComponent<Renderer>().material.color = Color.green;
        }
    }

    public void OnPlayerDeath()
    {
        StopAllCoroutines();

        if (deathScreen != null)
        {
            deathScreen.SetActive(true);
        }

        // 3 saniye sonra restart
        StartCoroutine(RestartAfterDelay(3f));
    }

    public void OnExitReached()
    {
        if (currentPhase != DemoPhase.AlarmPhase)
        {
            ShowObjective("Önce alarm butonuna bas!");
            return;
        }

        isCompleted = true;
        ShowVictory();
    }

    void ShowVictory()
    {
        if (victoryScreen != null)
        {
            victoryScreen.SetActive(true);
        }

        float totalTime = Time.time - startTime;
        Debug.Log($"[DEMO] Tamamlandı! Süre: {totalTime:F1} saniye");
    }

    void ShowObjective(string text)
    {
        if (objectiveText != null)
        {
            objectiveText.text = text;
        }
    }

    IEnumerator RestartAfterDelay(float delay)
    {
        yield return new WaitForSeconds(delay);
        UnityEngine.SceneManagement.SceneManager.LoadScene(
            UnityEngine.SceneManagement.SceneManager.GetActiveScene().name
        );
    }
}