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
const adminProducts = document.getElementById("adminProducts");

let editingProductId = null;


function showLogin(message = "") {
  loginPanel.style.display = "block";
  dashboardPanel.style.display = "none";
  loginMessage.textContent = message;
}


function showDashboard(user) {
  loginPanel.style.display = "none";
  dashboardPanel.style.display = "block";
  ownerEmail.textContent = user.email || "";

  loadAdminProducts();
}


async function checkSession() {

  const { data, error } =
    await supabaseClient.auth.getSession();

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

    loginMessage.textContent =
      "Please enter your email and password.";

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

    loginMessage.textContent =
      error.message;

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


/* =========================
   PUBLISH / UPDATE PRODUCT
========================= */

saveProduct.addEventListener("click", async () => {

  saveMessage.textContent = "";

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  if (!user || user.id !== OWNER_ID) {

    saveMessage.textContent =
      "You are not authorized to manage products.";

    return;
  }

  const name =
    document.getElementById("adminName").value.trim();

  const category =
    document.getElementById("adminCategory").value;

  const moq =
    document.getElementById("adminMoq").value.trim();

  const imageInput =
    document.getElementById("adminImage");

  const imageFile =
    imageInput.files[0];

  const description =
    document.getElementById("adminDesc").value.trim();


  if (!name || !moq || !description) {

    saveMessage.textContent =
      "Please fill Product Name, MOQ and Description.";

    return;
  }


  saveProduct.disabled = true;

  saveProduct.textContent =
    editingProductId
      ? "UPDATING..."
      : "PUBLISHING...";


  try {

    let imageUrl = null;


    /* EDIT EXISTING PRODUCT */

    if (editingProductId) {

      const updateData = {
        name: name,
        category: category.toLowerCase(),
        moq: moq,
        description: description
      };


      /* If a new image was selected, upload it */

      if (imageFile) {

        saveProduct.textContent =
          "UPLOADING IMAGE...";

        const fileExtension =
          imageFile.name
            .split(".")
            .pop()
            .toLowerCase();

        const fileName =
          OWNER_ID +
          "/" +
          Date.now() +
          "-" +
          Math.random()
            .toString(36)
            .substring(2, 8) +
          "." +
          fileExtension;


        const { error: uploadError } =
          await supabaseClient.storage
            .from("product-images")
            .upload(
              fileName,
              imageFile,
              {
                cacheControl: "3600",
                upsert: false
              }
            );


        if (uploadError) {

          throw new Error(
            "Image upload failed: " +
            uploadError.message
          );
        }


        const { data: publicUrlData } =
          supabaseClient.storage
            .from("product-images")
            .getPublicUrl(fileName);


        imageUrl =
          publicUrlData.publicUrl;

        updateData.image_url =
          imageUrl;
      }


      const { error: updateError } =
        await supabaseClient
          .from("products")
          .update(updateData)
          .eq("id", editingProductId);


      if (updateError) {

        throw new Error(
          "Product update failed: " +
          updateError.message
        );
      }


      saveMessage.textContent =
        "Product updated successfully.";

    }


    /* CREATE NEW PRODUCT */

    else {

      if (!imageFile) {

        saveMessage.textContent =
          "Please select a product image.";

        return;
      }


      saveProduct.textContent =
        "UPLOADING IMAGE...";


      const fileExtension =
        imageFile.name
          .split(".")
          .pop()
          .toLowerCase();


      const fileName =
        OWNER_ID +
        "/" +
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .substring(2, 8) +
        "." +
        fileExtension;


      const { error: uploadError } =
        await supabaseClient.storage
          .from("product-images")
          .upload(
            fileName,
            imageFile,
            {
              cacheControl: "3600",
              upsert: false
            }
          );


      if (uploadError) {

        throw new Error(
          "Image upload failed: " +
          uploadError.message
        );
      }


      saveProduct.textContent =
        "PUBLISHING PRODUCT...";


      const { data: publicUrlData } =
        supabaseClient.storage
          .from("product-images")
          .getPublicUrl(fileName);


      imageUrl =
        publicUrlData.publicUrl;


      const { error: productError } =
        await supabaseClient
          .from("products")
          .insert({
            name: name,
            category: category.toLowerCase(),
            description: description,
            moq: moq,
            image_url: imageUrl,
            published: true,
            in_stock: true
          });


      if (productError) {

        throw new Error(
          "Product save failed: " +
          productError.message
        );
      }


      saveMessage.textContent =
        "Product published successfully.";
    }


    clearProductForm();

    await loadAdminProducts();

  }

  catch (error) {

    saveMessage.textContent =
      "Error: " + error.message;

  }

  finally {

    saveProduct.disabled = false;

    saveProduct.textContent =
      "PUBLISH PRODUCT";
  }

});


/* =========================
   LOAD PRODUCTS IN ADMIN
========================= */

async function loadAdminProducts() {

  if (!adminProducts) {
    return;
  }


  adminProducts.innerHTML =
    "<p>Loading products...</p>";


  const { data, error } =
    await supabaseClient
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false
      });


  if (error) {

    adminProducts.innerHTML =
      `<p style="color:#a33;">
        Could not load products: ${error.message}
      </p>`;

    return;
  }


  if (!data || data.length === 0) {

    adminProducts.innerHTML =
      `<p style="color:#77736b;">
        No products published yet.
      </p>`;

    return;
  }


  adminProducts.innerHTML =
    data.map(product => {

      const stockText =
        product.in_stock === false
          ? "OUT OF STOCK"
          : "IN STOCK";


      const stockClass =
        product.in_stock === false
          ? "out"
          : "in";


      return `
        <article
          style="
            border:1px solid #ddd8cc;
            padding:20px;
            margin-bottom:18px;
            background:#fbfaf6;
          "
        >

          <div
            style="
              display:flex;
              gap:20px;
              align-items:flex-start;
              flex-wrap:wrap;
            "
          >

            <img
              src="${product.image_url || "product-placeholder.svg"}"
              alt="${product.name}"
              style="
                width:120px;
                height:120px;
                object-fit:cover;
                background:#eee;
              "
            >

            <div style="flex:1;min-width:220px;">

              <small
                style="
                  letter-spacing:1px;
                  text-transform:uppercase;
                  color:#77736b;
                "
              >
                ${product.category}
              </small>

              <h3 style="margin:7px 0;">
                ${product.name}
              </h3>

              <p style="margin:5px 0;">
                MOQ: <strong>${product.moq}</strong>
              </p>

              <p
                style="
                  margin:8px 0;
                  color:#77736b;
                "
              >
                ${product.description}
              </p>

              <strong
                style="
                  display:inline-block;
                  margin-top:8px;
                  font-size:12px;
                  letter-spacing:1px;
                "
              >
                ${stockText}
              </strong>

            </div>

          </div>


          <div
            style="
              display:flex;
              gap:10px;
              flex-wrap:wrap;
              margin-top:18px;
            "
          >

            <button
              class="btn btn-outline"
              onclick="editProduct('${product.id}')"
            >
              EDIT
            </button>

            <button
              class="btn btn-outline"
              onclick="toggleStock(
                '${product.id}',
                ${product.in_stock !== false}
              )"
            >
              ${
                product.in_stock === false
                  ? "MARK IN STOCK"
                  : "MARK OUT OF STOCK"
              }
            </button>

            <button
              class="btn btn-outline"
              onclick="deleteProduct('${product.id}')"
            >
              DELETE
            </button>

          </div>

        </article>
      `;

    }).join("");
}


/* =========================
   EDIT PRODUCT
========================= */

window.editProduct = async function(id) {

  const { data, error } =
    await supabaseClient
      .from("products")
      .select("*")
      .eq("id", id)
      .single();


  if (error) {

    saveMessage.textContent =
      "Could not load product.";

    return;
  }


  editingProductId = id;


  document.getElementById("adminName").value =
    data.name || "";


  document.getElementById("adminCategory").value =
    data.category
      ? data.category.charAt(0).toUpperCase() +
        data.category.slice(1)
      : "Perfumes";


  document.getElementById("adminMoq").value =
    data.moq || "";


  document.getElementById("adminDesc").value =
    data.description || "";


  document.getElementById("adminImage").value =
    "";


  saveProduct.textContent =
    "UPDATE PRODUCT";


  saveMessage.textContent =
    "Editing: " + data.name;


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

};


/* =========================
   STOCK STATUS
========================= */

window.toggleStock = async function(id, currentlyInStock) {

  const newStatus =
    !currentlyInStock;


  const { error } =
    await supabaseClient
      .from("products")
      .update({
        in_stock: newStatus
      })
      .eq("id", id);


  if (error) {

    alert(
      "Could not update stock status: " +
      error.message
    );

    return;
  }


  await loadAdminProducts();
};


/* =========================
   DELETE PRODUCT
========================= */

window.deleteProduct = async function(id) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this product?"
    );


  if (!confirmed) {
    return;
  }


  const { error } =
    await supabaseClient
      .from("products")
      .delete()
      .eq("id", id);


  if (error) {

    alert(
      "Could not delete product: " +
      error.message
    );

    return;
  }


  saveMessage.textContent =
    "Product deleted successfully.";


  await loadAdminProducts();
};


/* =========================
   CLEAR FORM
========================= */

function clearProductForm() {

  editingProductId = null;

  document.getElementById("adminName").value = "";
  document.getElementById("adminCategory").value = "Perfumes";
  document.getElementById("adminMoq").value = "";
  document.getElementById("adminImage").value = "";
  document.getElementById("adminDesc").value = "";

  saveProduct.textContent =
    "PUBLISH PRODUCT";
}


/* =========================
   AUTH STATE
========================= */

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    if (!session) {

      showLogin();

      return;
    }


    if (session.user.id !== OWNER_ID) {

      supabaseClient.auth.signOut();

      showLogin(
        "This account is not authorized."
      );

      return;
    }


    showDashboard(session.user);

  }
);


checkSession();
