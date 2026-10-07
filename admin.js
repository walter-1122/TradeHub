const SUPABASE_URL = "https://cgclqejzzlrxkuksqgav.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_BI34HY1C7-HR9ZzDrXuabQ_QtTRwbBx";

const OWNER_ID = "60fae016-d16f-40d3-8e96-63079637d574";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const loginPanel = document.getElementById("loginPanel");
const dashboardPanel = document.getElementById("dashboardPanel");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

const ownerEmail = document.getElementById("ownerEmail");
const logoutBtn = document.getElementById("logoutBtn");

const saveProduct = document.getElementById("saveProduct");
const saveMessage = document.getElementById("saveMessage");


function showLogin(message = "") {
  loginPanel.style.display = "block";
  dashboardPanel.style.display = "none";
  loginMessage.textContent = message;
}


function showDashboard(user) {
  loginPanel.style.display = "none";
  dashboardPanel.style.display = "block";
  ownerEmail.textContent = user.email || "";
}


async function checkSession() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    showLogin(error.message);
    return;
  }

  const session = data.session;

  if (!session) {
    showLogin();
    return;
  }

  if (session.user.id !== OWNER_ID) {
    await supabaseClient.auth.signOut();
    showLogin("This account is not authorized.");
    return;
  }

  showDashboard(session.user);
}


loginBtn.addEventListener("click", async () => {

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  loginMessage.textContent = "";

  if (!email || !password) {
    loginMessage.textContent = "Please enter your email and password.";
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "LOGGING IN...";

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

  loginBtn.disabled = false;
  loginBtn.textContent = "LOGIN";

  if (error) {
    loginMessage.textContent = error.message;
    return;
  }

  if (!data.user || data.user.id !== OWNER_ID) {
    await supabaseClient.auth.signOut();

    loginMessage.textContent =
      "This account is not authorized.";
    return;
  }

  showDashboard(data.user);
});


logoutBtn.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  showLogin("You have been logged out.");
});


saveProduct.addEventListener("click", async () => {

  saveMessage.textContent = "";

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  if (!user || user.id !== OWNER_ID) {
    saveMessage.textContent =
      "You are not authorized to publish products.";
    return;
  }

  const name = document.getElementById("adminName").value.trim();
  const category = document.getElementById("adminCategory").value;
  const moq = document.getElementById("adminMoq").value.trim();
  const imageFile = document.getElementById("adminImage").files[0];
  const description = document.getElementById("adminDesc").value.trim();

  if (!name || !moq || !description) {
    saveMessage.textContent =
      "Please fill Product Name, MOQ and Description.";
    return;
  }

  if (!imageFile) {
    saveMessage.textContent =
      "Please select a product image.";
    return;
  }

  saveProduct.disabled = true;
  saveProduct.textContent = "UPLOADING IMAGE...";

  try {

    const fileExtension =
      imageFile.name.split(".").pop().toLowerCase();

    const fileName =
      OWNER_ID + "/" +
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2, 8) +
      "." +
      fileExtension;

    const { error: uploadError } =
      await supabaseClient.storage
        .from("product-images")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false
        });

    if (uploadError) {
      throw new Error(
        "Image upload failed: " + uploadError.message
      );
    }

    saveProduct.textContent = "PUBLISHING PRODUCT...";

    const { data: publicUrlData } =
      supabaseClient.storage
        .from("product-images")
        .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    const { error: productError } =
      await supabaseClient
        .from("products")
        .insert({
          name: name,
          category: category,
          description: description,
          moq: moq,
          image_url: imageUrl,
          published: true
        });

    if (productError) {
      throw new Error(
        "Product save failed: " + productError.message
      );
    }

    saveMessage.textContent =
      "Product published successfully.";

    document.getElementById("adminName").value = "";
    document.getElementById("adminMoq").value = "";
    document.getElementById("adminImage").value = "";
    document.getElementById("adminDesc").value = "";

  } catch (error) {

    saveMessage.textContent =
      "Error: " + error.message;

  } finally {

    saveProduct.disabled = false;
    saveProduct.textContent = "PUBLISH PRODUCT";

  }
});


supabaseClient.auth.onAuthStateChange((event, session) => {

  if (!session) {
    showLogin();
    return;
  }

  if (session.user.id !== OWNER_ID) {
    supabaseClient.auth.signOut();
    showLogin("This account is not authorized.");
    return;
  }

  showDashboard(session.user);
});


checkSession();
