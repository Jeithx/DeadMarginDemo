using UnityEngine;

public class AlarmButton : MonoBehaviour
{
    [Header("Button Settings")]
    public float interactionRange = 2f;
    public GameObject promptText; // "E - Bas" yazısı

    private bool isUsed = false;
    private Transform player;

    void Start()
    {
        player = GameObject.FindGameObjectWithTag("Player").transform;
        if (promptText) promptText.SetActive(false);
    }

    void Update()
    {
        if (isUsed) return;

        float distance = Vector3.Distance(transform.position, player.position);

        // Yakınsa prompt göster
        if (distance < interactionRange)
        {
            if (promptText) promptText.SetActive(true);

            if (Input.GetKeyDown(KeyCode.E))
            {
                PressButton();
            }
        }
        else
        {
            if (promptText) promptText.SetActive(false);
        }
    }

    void PressButton()
    {
        isUsed = true;
        Debug.Log("[BUTTON] Alarm butonu basıldı!");

        // Butonu içeri it
        transform.position += transform.forward * -0.05f;

        // Rengi değiştir
        GetComponent<Renderer>().material.color = Color.green;

        // Alarmı tetikle
        AlarmSystem.Instance.TriggerAlarm();

        if (promptText) promptText.SetActive(false);
    }
}