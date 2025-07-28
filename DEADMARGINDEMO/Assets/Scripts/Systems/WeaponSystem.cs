using UnityEngine;

public class WeaponSystem : MonoBehaviour
{


    public enum WeaponType { Pistol, Knife }
    public WeaponType currentWeapon = WeaponType.Pistol;

    [Header("Weapon Sound Values (from GDD)")]
    private float pistolSound = 60f;    // Orta ses
    private float knifeSound = 20f;     // Çok düşük ses

    [Header("Weapon Settings")]
    public float pistolDamage = 50f;
    public float knifeDamage = 25f;
    public float pistolRange = 50f;
    public float knifeRange = 2f;
    public float fireRate = 0.5f;       // Saniyede 2 atış

    [Header("Components")]
    private Camera playerCamera;
    private PlayerController playerController;

    // Internal variables
    private float lastFireTime = 0f;
    private bool canFire = true;

    // Visual feedback
    private GameObject weaponVisual;

    void Start()
    {
        // PlayerController referansı
        playerController = GetComponent<PlayerController>();

        // Kamera bul - ÖNCELİK SIRASI ÖNEMLİ!
        // 1. Önce child'larda ara
        playerCamera = GetComponentInChildren<Camera>();

        // 2. Bulamazsan ana kamerayı al
        if (playerCamera == null)
        {
            playerCamera = Camera.main;
        }

        // 3. Hala yoksa hata ver ama çökme
        if (playerCamera == null)
        {
            Debug.LogError("[WEAPON] Kamera bulunamadı! Weapon visuals oluşturulamayacak.");
            return; // CreateWeaponVisuals'ı çağırma
        }

        // Kamera varsa devam et
        CreateWeaponVisuals();
        SwitchWeapon(currentWeapon);
    }

    void Update()
    {
        HandleWeaponInput();
        UpdateWeaponPosition();
    }

    void HandleWeaponInput()
    {
        // Sol tık - Ateş et/Salla
        if (Input.GetMouseButton(0) && canFire)
        {
            if (Time.time - lastFireTime >= fireRate)
            {
                UseWeapon();
                lastFireTime = Time.time;
            }
        }

        // Q - Silah değiştir
        if (Input.GetKeyDown(KeyCode.Q))
        {
            SwitchWeapon(currentWeapon == WeaponType.Pistol ? WeaponType.Knife : WeaponType.Pistol);
        }

        // R - Reload (sadece feedback için)
        if (Input.GetKeyDown(KeyCode.T) && currentWeapon == WeaponType.Pistol)
        {
            Debug.Log("[WEAPON] Tabanca dolduruldu!");
            playerController.EmitSound(30f); // Dolum sesi
        }
    }

    void UseWeapon()
    {
        switch (currentWeapon)
        {
            case WeaponType.Pistol:
                FirePistol();
                break;
            case WeaponType.Knife:
                SwingKnife();
                break;
        }
    }

    void FirePistol()
    {
        Debug.Log("[WEAPON] Tabanca ateşlendi!");

        // Ses yay
        playerController.EmitSound(pistolSound);

        // Basit raycast ile atış
        RaycastHit hit;
        Ray ray = new Ray(playerCamera.transform.position, playerCamera.transform.forward);

        if (Physics.Raycast(ray, out hit, pistolRange))
        {
            Debug.Log($"[WEAPON] Hedef vuruldu: {hit.collider.name}");

            // Yaratığa vurduysa
            CreatureAI creature = hit.collider.GetComponent<CreatureAI>();
            if (creature != null)
            {
                creature.TakeDamage(pistolDamage);
            }
        }

        // Görsel feedback
        StartCoroutine(MuzzleFlash());
    }

    void SwingKnife()
    {
        Debug.Log("[WEAPON] Bıçak sallandı!");

        // Ses yay
        playerController.EmitSound(knifeSound);

        // Yakın mesafe kontrol
        Collider[] nearbyObjects = Physics.OverlapSphere(playerCamera.transform.position + playerCamera.transform.forward * knifeRange / 2, knifeRange / 2);

        foreach (Collider col in nearbyObjects)
        {
            if (col.CompareTag("Enemy"))
            {
                Debug.Log($"[WEAPON] Bıçak hedefi vurdu: {col.name}");

                CreatureAI creature = col.GetComponent<CreatureAI>();
                if (creature != null)
                {
                    creature.TakeDamage(knifeDamage);
                }
            }
        }

        // Görsel feedback
        StartCoroutine(KnifeSwing());
    }

    void SwitchWeapon(WeaponType newWeapon)
    {
        currentWeapon = newWeapon;
        Debug.Log($"[WEAPON] Silah değiştirildi: {currentWeapon}");

        // Görsel güncelle
        UpdateWeaponVisual();

        // Silah değiştirme sesi
        playerController.EmitSound(15f);
    }

    void CreateWeaponVisuals()
    {
        // Basit silah görseli
        weaponVisual = GameObject.CreatePrimitive(PrimitiveType.Cube);
        weaponVisual.name = "WeaponVisual";
        weaponVisual.transform.SetParent(playerCamera.transform);
        weaponVisual.transform.localPosition = new Vector3(0.5f, -0.3f, 1f);

        // Collider'ı kapat
        Destroy(weaponVisual.GetComponent<Collider>());
    }

    void UpdateWeaponVisual()
    {
        if (weaponVisual == null) return;

        switch (currentWeapon)
        {
            case WeaponType.Pistol:
                weaponVisual.transform.localScale = new Vector3(0.15f, 0.2f, 0.4f);
                weaponVisual.GetComponent<Renderer>().material.color = Color.black;
                break;
            case WeaponType.Knife:
                weaponVisual.transform.localScale = new Vector3(0.05f, 0.1f, 0.3f);
                weaponVisual.GetComponent<Renderer>().material.color = Color.gray;
                break;
        }
    }

    void UpdateWeaponPosition()
    {
        if (weaponVisual == null) return;

        // Basit sallanma efekti
        float bobAmount = Mathf.Sin(Time.time * 5f) * 0.01f;
        weaponVisual.transform.localPosition = new Vector3(0.5f, -0.3f + bobAmount, 1f);
    }

    // Görsel efektler
    System.Collections.IEnumerator MuzzleFlash()
    {
        // Geçici bir ışık efekti
        GameObject flash = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        flash.transform.position = weaponVisual.transform.position + weaponVisual.transform.forward * 0.3f;
        flash.transform.localScale = Vector3.one * 0.2f;
        flash.GetComponent<Renderer>().material.color = Color.yellow;
        Destroy(flash.GetComponent<Collider>());

        yield return new WaitForSeconds(0.1f);
        Destroy(flash);
    }

    System.Collections.IEnumerator KnifeSwing()
    {
        // Bıçak sallama animasyonu
        float swingTime = 0.2f;
        float elapsed = 0f;
        Quaternion startRot = weaponVisual.transform.localRotation;
        Quaternion endRot = Quaternion.Euler(0, -45f, 0);

        while (elapsed < swingTime)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / swingTime;
            weaponVisual.transform.localRotation = Quaternion.Lerp(startRot, endRot, t);
            yield return null;
        }

        weaponVisual.transform.localRotation = startRot;
    }
}