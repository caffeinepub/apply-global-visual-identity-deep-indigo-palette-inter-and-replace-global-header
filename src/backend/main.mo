import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  type OrgId = Text;

  type ProjectPhase = {
    #planning;
    #inProgress;
    #completed;
  };

  type DealStage = {
    #prospecting;
    #negotiation;
    #closedWon;
    #closedLost;
  };

  public type AppUserRole = {
    #FIRSTY_ADMIN;
    #FIRSTY_CONSULTANT;
    #OWNER_ADMIN;
    #MEMBER;
  };

  public type UserProfile = {
    firstName : Text;
    lastName : Text;
    email : Text;
    currentOrgId : ?OrgId;
    appRole : AppUserRole;
  };

  public type Organization = {
    id : OrgId;
    name : Text;
    createdBy : Principal;
    createdAt : Int;
  };

  public type OrgMembership = {
    userId : Principal;
    orgId : OrgId;
    joinedAt : Int;
  };

  public type DocumentCategory = {
    #contracts;
    #invoices;
    #presentations;
    #reports;
    #marketing;
    #mediaAssets;
    #projectDocs;
    #proposals;
    #legal;
    #other;
  };

  public type Document = {
    id : Text;
    file : Storage.ExternalBlob;
    name : Text;
    uploadedBy : Principal;
    orgId : OrgId;
    uploadedAt : Int;
    category : DocumentCategory;
  };

  public type DocumentUploadInput = {
    name : Text;
    orgId : OrgId;
    file : Storage.ExternalBlob;
    category : DocumentCategory;
  };

  public type Contact = {
    id : Text;
    name : Text;
    email : Text;
    phone : Text;
    createdBy : Principal;
    orgId : OrgId;
  };

  public type Project = {
    id : Text;
    name : Text;
    description : Text;
    phase : ProjectPhase;
    createdBy : Principal;
    orgId : OrgId;
  };

  public type Deal = {
    id : Text;
    name : Text;
    value : Nat;
    stage : DealStage;
    createdBy : Principal;
    orgId : OrgId;
  };

  public type Activity = {
    id : Text;
    name : Text;
    dueDate : ?Int;
    completed : Bool;
    relatedProject : ?Text;
    orgId : OrgId;
    createdBy : Principal;
  };

  public type Contract = {
    id : Text;
    name : Text;
    value : Nat;
    startDate : Int;
    endDate : ?Int;
    orgId : OrgId;
    createdBy : Principal;
    isCancelled : Bool;
    cancellationReason : Text;
  };

  public type NpsCampaign = {
    id : Text;
    name : Text;
    orgId : OrgId;
    createdBy : Principal;
    createdAt : Int;
    status : Text;
  };

  public type NpsResponse = {
    orgId : OrgId;
    campaignId : Text;
    contractId : Text;
    score : Nat;
    comment : Text;
    recommendReason : Text;
    notRecommendReason : Text;
    isSuccessStory : Bool;
    submittedBy : Principal;
    submittedAt : Int;
  };

  public type Report = {
    id : Text;
    reportType : Text;
    period : Text;
    format : Text;
    generatedAt : Int;
    generatedBy : Principal;
    orgId : OrgId;
  };

  public type FinanceTransaction = {
    id : Text;
    description : Text;
    amount : Nat;
    createdBy : Principal;
    orgId : OrgId;
    createdAt : Int;
  };

  public type TeamInvitation = {
    id : Text;
    inviteeIdentifier : Text;
    orgId : OrgId;
    invitedBy : Principal;
    invitedAt : Int;
    status : Text;
  };

  public type SupportMessage = {
    id : Text;
    orgId : OrgId;
    message : Text;
    sentBy : Principal;
    sentAt : Int;
  };

  public type ChurnParams = {
    orgId : OrgId;
    startTime : Int;
    endTime : Int;
  };

  public type ChurnOverview = {
    orgId : OrgId;
    totalContracts : Nat;
    totalCancelledContracts : Nat;
    cancellationReasons : [(Text, Nat)];
    periodCancelledContracts : Nat;
    periodCanceledContracts : Nat;
    periodActiveContracts : Nat;
    periodRetentionRate : Float;
    periodChurnRate : Float;
    periodNetPromoterScore : Float;
  };

  public type CancellationStats = {
    reason : Text;
    count : Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let organizations = Map.empty<OrgId, Organization>();
  let orgMemberships = Map.empty<Principal, [OrgId]>();
  let contacts = Map.empty<Text, Contact>();
  let projects = Map.empty<Text, Project>();
  let deals = Map.empty<Text, Deal>();
  let documents = Map.empty<Text, Document>();
  let activities = Map.empty<Text, Activity>();
  let contracts = Map.empty<Text, Contract>();
  let npsCampaigns = Map.empty<Text, NpsCampaign>();
  let npsResponses = Map.empty<Text, NpsResponse>();
  let reports = Map.empty<Text, Report>();
  let financeTransactions = Map.empty<Text, FinanceTransaction>();
  let teamInvitations = Map.empty<Text, TeamInvitation>();
  let supportMessages = Map.empty<Text, SupportMessage>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  func isFirstyStaff(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case null { false };
      case (?profile) {
        switch (profile.appRole) {
          case (#FIRSTY_ADMIN) { true };
          case (#FIRSTY_CONSULTANT) { true };
          case (_) { false };
        };
      };
    };
  };

  func isMemberOfOrg(user : Principal, orgId : OrgId) : Bool {
    switch (orgMemberships.get(user)) {
      case null { false };
      case (?orgs) {
        for (org in orgs.values()) {
          if (org == orgId) { return true };
        };
        false;
      };
    };
  };

  func getCallerOrgId(caller : Principal) : ?OrgId {
    switch (userProfiles.get(caller)) {
      case null { null };
      case (?profile) { profile.currentOrgId };
    };
  };

  func verifyOrgAccess(caller : Principal, orgId : OrgId) {
    // Firsty staff can access all organizations
    if (isFirstyStaff(caller)) {
      return;
    };

    if (not isMemberOfOrg(caller, orgId)) {
      Runtime.trap("Unauthorized: Not a member of this organization");
    };
  };

  func isOrgCreator(caller : Principal, orgId : OrgId) : Bool {
    switch (organizations.get(orgId)) {
      case null { false };
      case (?org) { org.createdBy == caller };
    };
  };

  func verifyOrgManagementAccess(caller : Principal, orgId : OrgId) {
    // Firsty staff can manage all organizations
    if (isFirstyStaff(caller)) {
      return;
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isCreator = isOrgCreator(caller, orgId);
    if (not (isAdmin or isCreator)) {
      Runtime.trap("Unauthorized: Only organization creators or admins can manage this organization");
    };
  };

  func verifyDataEditAccess(caller : Principal, orgId : OrgId) {
    // Firsty staff can edit data for any organization
    if (isFirstyStaff(caller)) {
      return;
    };

    // Regular users must be members of the organization
    if (not isMemberOfOrg(caller, orgId)) {
      Runtime.trap("Unauthorized: Cannot edit data for this organization");
    };
  };

  func getUserOrgs(user : Principal) : [OrgId] {
    switch (orgMemberships.get(user)) {
      case null { [] };
      case (?orgs) { orgs };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    // Users can view their own profile, Firsty staff can view any profile
    if (caller != user and not isFirstyStaff(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Prevent privilege escalation - users cannot assign themselves Firsty staff roles
    let existingProfile = userProfiles.get(caller);
    switch (existingProfile) {
      case null {
        // New profile - cannot start as Firsty staff
        switch (profile.appRole) {
          case (#FIRSTY_ADMIN or #FIRSTY_CONSULTANT) {
            Runtime.trap("Unauthorized: Cannot assign Firsty staff roles to yourself");
          };
          case (_) {};
        };
      };
      case (?existing) {
        // Existing profile - cannot change to/from Firsty staff roles unless already Firsty staff
        let wasFirstyStaff = switch (existing.appRole) {
          case (#FIRSTY_ADMIN or #FIRSTY_CONSULTANT) { true };
          case (_) { false };
        };
        let isNowFirstyStaff = switch (profile.appRole) {
          case (#FIRSTY_ADMIN or #FIRSTY_CONSULTANT) { true };
          case (_) { false };
        };
        if (wasFirstyStaff != isNowFirstyStaff and not wasFirstyStaff) {
          Runtime.trap("Unauthorized: Cannot assign Firsty staff roles to yourself");
        };
      };
    };

    // Verify role constraints
    switch (profile.appRole) {
      case (#OWNER_ADMIN or #MEMBER) {
        // Must have exactly one organization
        switch (profile.currentOrgId) {
          case null {
            Runtime.trap("OWNER_ADMIN and MEMBER must belong to an organization");
          };
          case (?orgId) {
            // Verify user is actually a member of this organization
            if (not isMemberOfOrg(caller, orgId)) {
              Runtime.trap("Cannot set currentOrgId to an organization you are not a member of");
            };
          };
        };
      };
      case (#FIRSTY_ADMIN or #FIRSTY_CONSULTANT) {
        // Can access all organizations, currentOrgId is optional
      };
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createOrganization(name : Text, timestamp : Int) : async OrgId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create organizations");
    };
    let orgId = caller.toText() # "-" # Int.toText(timestamp);
    let org : Organization = {
      id = orgId;
      name = name;
      createdBy = caller;
      createdAt = timestamp;
    };
    organizations.add(orgId, org);

    let currentOrgs = switch (orgMemberships.get(caller)) {
      case null { [] };
      case (?orgs) { orgs };
    };
    orgMemberships.add(caller, currentOrgs.concat([orgId]));

    orgId;
  };

  public query ({ caller }) func getOrganization(orgId : OrgId) : async ?Organization {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view organizations");
    };
    verifyOrgAccess(caller, orgId);
    organizations.get(orgId);
  };

  public query ({ caller }) func listOrganizations() : async [Organization] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list organizations");
    };

    // Firsty staff can see all organizations
    if (isFirstyStaff(caller)) {
      return organizations.values().toArray();
    };

    // Regular users can only see their organizations
    let userOrgs = getUserOrgs(caller);
    let orgsIter = organizations.values();
    let filteredIter = orgsIter.filter(func(org) {
      for (userOrg in userOrgs.values()) {
        if (org.id == userOrg) { return true };
      };
      false;
    });
    filteredIter.toArray();
  };

  public shared ({ caller }) func updateOrganization(orgId : OrgId, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update organizations");
    };
    verifyOrgManagementAccess(caller, orgId);

    let org = switch (organizations.get(orgId)) {
      case (null) { Runtime.trap("Organization not found") };
      case (?o) { o };
    };

    let updatedOrg = {
      org with name = name;
    };
    organizations.add(orgId, updatedOrg);
  };

  public shared ({ caller }) func deleteOrganization(orgId : OrgId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete organizations");
    };
    verifyOrgManagementAccess(caller, orgId);

    // Remove organization
    organizations.remove(orgId);

    // Remove all memberships for this organization
    for ((user, orgs) in orgMemberships.entries()) {
      let filteredOrgs = orgs.filter(func(org) { org != orgId });
      if (filteredOrgs.size() > 0) {
        orgMemberships.add(user, filteredOrgs);
      } else {
        orgMemberships.remove(user);
      };
    };
  };

  public shared ({ caller }) func createContact(contact : Contact) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create contacts");
    };
    verifyDataEditAccess(caller, contact.orgId);
    if (contact.createdBy != caller) {
      Runtime.trap("Unauthorized: Cannot create contact for another user");
    };
    contacts.add(contact.id, contact);
  };

  public shared ({ caller }) func updateContact(id : Text, name : Text, email : Text, phone : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update contacts");
    };

    let contact = switch (contacts.get(id)) {
      case (null) { Runtime.trap("Contact not found") };
      case (?c) { c };
    };

    verifyDataEditAccess(caller, contact.orgId);

    let updatedContact = {
      contact with
      name = name;
      email = email;
      phone = phone;
    };
    contacts.add(id, updatedContact);
  };

  public shared ({ caller }) func deleteContact(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete contacts");
    };

    let contact = switch (contacts.get(id)) {
      case (null) { Runtime.trap("Contact not found") };
      case (?c) { c };
    };

    verifyDataEditAccess(caller, contact.orgId);
    contacts.remove(id);
  };

  public query ({ caller }) func getContact(id : Text) : async ?Contact {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view contacts");
    };
    switch (contacts.get(id)) {
      case null { null };
      case (?contact) {
        verifyOrgAccess(caller, contact.orgId);
        ?contact;
      };
    };
  };

  public query ({ caller }) func listContacts(orgId : OrgId) : async [Contact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list contacts");
    };
    verifyOrgAccess(caller, orgId);
    let contactsIter = contacts.values();
    let filteredIter = contactsIter.filter(func(contact) { contact.orgId == orgId });
    filteredIter.toArray();
  };
};
