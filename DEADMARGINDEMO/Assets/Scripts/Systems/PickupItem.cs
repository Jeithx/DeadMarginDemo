using UnityEngine;

public class PickupItem : MonoBehaviour
{
    public enum ItemType { Knife, Flashlight }

    [Header("Pickup Settings")]
    public ItemType itemType;
    public float rotationSpeed = 50f;
    public float bobSpeed = 2f;
    public float bobHeight = 0.2f;

    private Vector3 startPos;

    void Start()
    {
        startPos = transform.position;

        // Glow efekti için basit ışık
        var light = gameObject.AddComponent<Light>();
        light.type = LightType.Point;
        light.range = 3f;
        light.intensity = 0.5f;

        switch (itemType)
        {
            case ItemType.Knife:
                light.color = Color.red;
                break;
            case ItemType.Flashlight:
                light.color = Color.yellow;
                break;
        }
    }

    void Update()
    {
        // Dönme
        transform.Rotate(Vector3.up * rotationSpeed * Time.deltaTime);

        // Yukarı aşağı hareket
        float newY = startPos.y + Mathf.Sin(Time.time * bobSpeed) * bobHeight;
        transform.position = new Vector3(startPos.x, newY, startPos.z);
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            var demoPlayer = other.GetComponent<DemoPlayerController>();

            switch (itemType)
            {
                case ItemType.Knife:
                    demoPlayer.PickupKnife();
                    AudioSource.PlayClipAtPoint(GetComponent<AudioSource>().clip, transform.position);
                    break;

                case ItemType.Flashlight:
                    demoPlayer.PickupFlashlight();
                    break;
            }

            Destroy(gameObject);
        }
    }
}