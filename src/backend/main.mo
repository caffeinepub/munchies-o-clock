import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type Category = {
    id : Nat;
    name : Text;
    description : Text;
  };

  public type Item = {
    id : Nat;
    name : Text;
    categoryId : Nat;
    description : Text;
    price : Nat; // Price in cents
    available : Bool;
  };

  public type OrderItem = {
    itemId : Nat;
    quantity : Nat;
  };

  public type OrderStatus = {
    #pending;
    #inProgress;
    #completed;
    #cancelled;
  };

  public type Order = {
    id : Nat;
    items : [OrderItem];
    total : Nat; // Total price in cents
    status : OrderStatus;
    timestamp : Int; // Unix timestamp
    customer : Principal;
  };

  var nextCategoryId = 1;
  var nextItemId = 1;
  var nextOrderId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let categories = Map.empty<Nat, Category>();
  let items = Map.empty<Nat, Item>();
  let orders = Map.empty<Nat, Order>();

  module CategoryModule {
    public func compare(a : Category, b : Category) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module ItemModule {
    public func compare(a : Item, b : Item) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module OrderModule {
    public func compare(a : Order, b : Order) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Category Management (Admin only)
  public shared ({ caller }) func createCategory(name : Text, description : Text) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    let categoryId = nextCategoryId;
    let category : Category = {
      id = categoryId;
      name;
      description;
    };
    categories.add(categoryId, category);
    nextCategoryId += 1;
    categoryId;
  };

  public shared ({ caller }) func updateCategory(categoryId : Nat, name : Text, description : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        let category : Category = {
          id = categoryId;
          name;
          description;
        };
        categories.add(categoryId, category);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(categoryId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    // Check if any items reference this category
    for (item in items.values()) {
      if (item.categoryId == categoryId) {
        Runtime.trap("Cannot delete category with existing items");
      };
    };
    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        categories.remove(categoryId);
      };
    };
  };

  // Item Management (Admin only)
  public shared ({ caller }) func createItem(
    name : Text,
    categoryId : Nat,
    description : Text,
    price : Nat,
    available : Bool,
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category does not exist") };
      case (?_) {};
    };
    let itemId = nextItemId;
    let item : Item = {
      id = itemId;
      name;
      categoryId;
      description;
      price;
      available;
    };
    items.add(itemId, item);
    nextItemId += 1;
    itemId;
  };

  public shared ({ caller }) func updateItem(
    itemId : Nat,
    name : Text,
    categoryId : Nat,
    description : Text,
    price : Nat,
    available : Bool,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category does not exist") };
      case (?_) {};
    };
    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?_) {
        let item : Item = {
          id = itemId;
          name;
          categoryId;
          description;
          price;
          available;
        };
        items.add(itemId, item);
      };
    };
  };

  public shared ({ caller }) func deleteItem(itemId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?_) {
        items.remove(itemId);
      };
    };
  };

  // Order Management
  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : OrderStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        switch (order.status, newStatus) {
          case (#pending, #inProgress) {};
          case (#inProgress, #completed) {};
          case (_, #cancelled) {};
          case (_) { Runtime.trap("Invalid status transition") };
        };
        let updatedOrder : Order = {
          id = order.id;
          items = order.items;
          total = order.total;
          status = newStatus;
          timestamp = order.timestamp;
          customer = order.customer;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  // Public queries (authenticated users only)
  public query ({ caller }) func getAllCategories() : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view categories");
    };
    categories.values().toArray().sort();
  };

  public query ({ caller }) func getAllItems() : async [Item] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view items");
    };
    items.values().toArray().sort();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    orders.values().toArray().sort();
  };

  public query ({ caller }) func getCustomerOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };
    let customerOrders = orders.values().toArray().filter(
      func(order : Order) : Bool {
        order.customer == caller;
      },
    );
    customerOrders.sort();
  };

  public shared ({ caller }) func placeOrder(orderItems : [OrderItem]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };

    if (orderItems.size() == 0) {
      Runtime.trap("Order must contain at least one item");
    };

    var total = 0;
    for (orderItem in orderItems.values()) {
      switch (items.get(orderItem.itemId)) {
        case (null) { Runtime.trap("Item not found") };
        case (?item) {
          if (not item.available) {
            Runtime.trap("Item not available: " # item.name);
          };
          if (orderItem.quantity == 0) {
            Runtime.trap("Item quantity must be greater than zero");
          };
          total += item.price * orderItem.quantity;
        };
      };
    };

    let order : Order = {
      id = nextOrderId;
      items = orderItems;
      total;
      status = #pending;
      timestamp = Time.now();
      customer = caller;
    };
    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order.id;
  };
};
