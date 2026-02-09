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
import Migration "migration";

(with migration = Migration.run)
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

    // Verify role constraints
    switch (profile.appRole) {
      case (#OWNER_ADMIN or #MEMBER) {
        // Must have exactly one organization
        if (profile.currentOrgId == null) {
          Runtime.trap("OWNER_ADMIN and MEMBER must belong to an organization");
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

  public shared ({ caller }) func createProject(project : Project) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create projects");
    };
    verifyDataEditAccess(caller, project.orgId);
    if (project.createdBy != caller) {
      Runtime.trap("Unauthorized: Cannot create project for another user");
    };
    projects.add(project.id, project);
  };

  public query ({ caller }) func getProject(id : Text) : async ?Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };
    switch (projects.get(id)) {
      case null { null };
      case (?project) {
        verifyOrgAccess(caller, project.orgId);
        ?project;
      };
    };
  };

  public query ({ caller }) func listProjects(orgId : OrgId) : async [Project] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list projects");
    };
    verifyOrgAccess(caller, orgId);
    let projectsIter = projects.values();
    let filteredIter = projectsIter.filter(func(project) { project.orgId == orgId });
    filteredIter.toArray();
  };

  public shared ({ caller }) func createDeal(deal : Deal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create deals");
    };
    verifyDataEditAccess(caller, deal.orgId);
    if (deal.createdBy != caller) {
      Runtime.trap("Unauthorized: Cannot create deal for another user");
    };
    deals.add(deal.id, deal);
  };

  public query ({ caller }) func getDeal(id : Text) : async ?Deal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view deals");
    };
    switch (deals.get(id)) {
      case null { null };
      case (?deal) {
        verifyOrgAccess(caller, deal.orgId);
        ?deal;
      };
    };
  };

  public query ({ caller }) func listDeals(orgId : OrgId) : async [Deal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list deals");
    };
    verifyOrgAccess(caller, orgId);
    let dealsIter = deals.values();
    let filteredIter = dealsIter.filter(func(deal) { deal.orgId == orgId });
    filteredIter.toArray();
  };

  public shared ({ caller }) func createActivity(activity : Activity) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create activities");
    };
    verifyDataEditAccess(caller, activity.orgId);
    if (activity.createdBy != caller) {
      Runtime.trap("Unauthorized: Cannot create activity for another user");
    };
    activities.add(activity.id, activity);
  };

  public query ({ caller }) func getActivity(id : Text) : async ?Activity {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view activities");
    };
    switch (activities.get(id)) {
      case null { null };
      case (?activity) {
        verifyOrgAccess(caller, activity.orgId);
        ?activity;
      };
    };
  };

  public query ({ caller }) func listActivities(orgId : OrgId) : async [Activity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list activities");
    };
    verifyOrgAccess(caller, orgId);
    let activitiesIter = activities.values();
    let filteredIter = activitiesIter.filter(func(activity) { activity.orgId == orgId });
    filteredIter.toArray();
  };

  public shared ({ caller }) func createContract(contract : Contract) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create contracts");
    };
    verifyDataEditAccess(caller, contract.orgId);
    if (contract.createdBy != caller) {
      Runtime.trap("Unauthorized: Cannot create contract for another user");
    };
    contracts.add(contract.id, contract);
  };

  public shared ({ caller }) func cancelContract(contractId : Text, cancellationReason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel contracts");
    };
    let contract = switch (contracts.get(contractId)) {
      case (null) { Runtime.trap("Contract not found") };
      case (?c) { c };
    };
    verifyDataEditAccess(caller, contract.orgId);
    let updatedContract = {
      contract with
      isCancelled = true;
      cancellationReason;
    };
    contracts.add(contractId, updatedContract);
  };

  public query ({ caller }) func getContract(id : Text) : async ?Contract {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view contracts");
    };
    switch (contracts.get(id)) {
      case null { null };
      case (?contract) {
        verifyOrgAccess(caller, contract.orgId);
        ?contract;
      };
    };
  };

  public query ({ caller }) func listContracts(orgId : OrgId) : async [Contract] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list contracts");
    };
    verifyOrgAccess(caller, orgId);
    let contractsIter = contracts.values();
    let filteredIter = contractsIter.filter(func(contract) { contract.orgId == orgId });
    filteredIter.toArray();
  };

  public query ({ caller }) func listCancelledContracts(orgId : OrgId) : async [Contract] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list contracts");
    };
    verifyOrgAccess(caller, orgId);
    let contractsIter = contracts.values();
    let filteredIter = contractsIter.filter(func(contract) {
      contract.orgId == orgId and contract.isCancelled;
    });
    filteredIter.toArray();
  };

  public query ({ caller }) func getCancellationStats(orgId : OrgId) : async [CancellationStats] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cancellation stats");
    };
    verifyOrgAccess(caller, orgId);

    let cancellations = contracts.values().filter(func(c) { c.orgId == orgId and c.isCancelled }).toArray();

    let stats = Map.empty<Text, Nat>();
    for (c in cancellations.values()) {
      let count = switch (stats.get(c.cancellationReason)) {
        case (null) { 0 };
        case (?n) { n };
      };
      stats.add(c.cancellationReason, count + 1);
    };

    let output : [CancellationStats] = switch (stats.size()) {
      case (0) { [] };
      case (_) {
        stats.entries().map<(Text, Nat), CancellationStats>(
          func((reason, count)) { { reason; count } }
        ).toArray();
      };
    };
    output;
  };

  public shared ({ caller }) func createFinanceTransaction(transaction : FinanceTransaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create finance transactions");
    };
    verifyDataEditAccess(caller, transaction.orgId);
    if (transaction.createdBy != caller) {
      Runtime.trap("Unauthorized: Cannot create finance transaction for another user");
    };
    financeTransactions.add(transaction.id, transaction);
  };

  public query ({ caller }) func getFinanceTransaction(id : Text) : async ?FinanceTransaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view finance transactions");
    };
    switch (financeTransactions.get(id)) {
      case null { null };
      case (?transaction) {
        verifyOrgAccess(caller, transaction.orgId);
        ?transaction;
      };
    };
  };

  public query ({ caller }) func listFinanceTransactions(orgId : OrgId) : async [FinanceTransaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list finance transactions");
    };
    verifyOrgAccess(caller, orgId);
    let financeIter = financeTransactions.values();
    let filteredIter = financeIter.filter(func(transaction) { transaction.orgId == orgId });
    filteredIter.toArray();
  };

  public shared ({ caller }) func uploadDocument(input : DocumentUploadInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload documents");
    };
    verifyDataEditAccess(caller, input.orgId);

    let newDocument : Document = {
      id = input.name;
      file = input.file;
      name = input.name;
      uploadedBy = caller;
      orgId = input.orgId;
      uploadedAt = 0;
      category = input.category;
    };

    documents.add(newDocument.id, newDocument);
  };

  public query ({ caller }) func getDocument(id : Text) : async ?Document {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view documents");
    };
    switch (documents.get(id)) {
      case null { null };
      case (?document) {
        verifyOrgAccess(caller, document.orgId);
        ?document;
      };
    };
  };

  public query ({ caller }) func listDocuments(orgId : OrgId) : async [Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list documents");
    };
    verifyOrgAccess(caller, orgId);
    let documentsIter = documents.values();
    let filteredIter = documentsIter.filter(func(document) { document.orgId == orgId });
    filteredIter.toArray();
  };

  public shared ({ caller }) func createNpsCampaign(campaign : NpsCampaign) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create NPS campaigns");
    };
    verifyDataEditAccess(caller, campaign.orgId);
    if (campaign.createdBy != caller) {
      Runtime.trap("Unauthorized: Cannot create NPS campaign for another user");
    };
    npsCampaigns.add(campaign.id, campaign);
  };

  public query ({ caller }) func getNpsCampaign(id : Text) : async ?NpsCampaign {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view NPS campaigns");
    };
    switch (npsCampaigns.get(id)) {
      case null { null };
      case (?campaign) {
        verifyOrgAccess(caller, campaign.orgId);
        ?campaign;
      };
    };
  };

  public query ({ caller }) func listNpsCampaigns(orgId : OrgId) : async [NpsCampaign] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list NPS campaigns");
    };
    verifyOrgAccess(caller, orgId);
    let campaignsIter = npsCampaigns.values();
    let filteredIter = campaignsIter.filter(func(campaign) { campaign.orgId == orgId });
    filteredIter.toArray();
  };

  public shared ({ caller }) func submitNpsResponse(response : NpsResponse) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit NPS responses");
    };
    verifyDataEditAccess(caller, response.orgId);
    if (response.submittedBy != caller) {
      Runtime.trap("Unauthorized: Cannot submit NPS response for another user");
    };
    npsResponses.add(response.campaignId, response);
  };

  public query ({ caller }) func getNpsResponses(orgId : OrgId) : async [NpsResponse] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view NPS responses");
    };
    verifyOrgAccess(caller, orgId);

    let npsResponsesIter = npsResponses.values();
    let filteredIter = npsResponsesIter.filter(func(response) { response.orgId == orgId });
    filteredIter.toArray();
  };

  public query ({ caller }) func getNpsResponsesForPeriod(orgId : OrgId, startTime : Int, endTime : Int) : async [NpsResponse] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view NPS responses");
    };
    verifyOrgAccess(caller, orgId);
    let npsResponsesIter = npsResponses.values();
    let filteredIter = npsResponsesIter.filter(func(response) {
      response.orgId == orgId and response.submittedAt >= startTime and response.submittedAt <= endTime
    });
    filteredIter.toArray();
  };

  public query ({ caller }) func getNpsResponsesForTimeFrame(
    orgId : OrgId,
    campaignId : Text,
    startTime : Int,
    endTime : Int,
  ) : async [NpsResponse] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view NPS responses");
    };
    verifyOrgAccess(caller, orgId);
    let npsResponsesIter = npsResponses.values();
    let filteredIter = npsResponsesIter.filter(func(response) {
      response.campaignId == campaignId and
      response.orgId == orgId and response.submittedAt >= startTime and response.submittedAt <= endTime
    });
    filteredIter.toArray();
  };

  public query ({ caller }) func getNpsResponsesByCampaign(campaignId : Text) : async [NpsResponse] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view NPS responses");
    };

    // Verify caller has access to the campaign's organization
    let campaign = switch (npsCampaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?c) { c };
    };
    verifyOrgAccess(caller, campaign.orgId);

    let npsResponsesIter = npsResponses.values();
    let filteredIter = npsResponsesIter.filter(func(response) { response.campaignId == campaignId });
    filteredIter.toArray();
  };

  public query ({ caller }) func getNpsResponseByContract(contractId : Text) : async [NpsResponse] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view NPS responses");
    };

    // Verify caller has access to the contract's organization
    let contract = switch (contracts.get(contractId)) {
      case (null) { Runtime.trap("Contract not found") };
      case (?c) { c };
    };
    verifyOrgAccess(caller, contract.orgId);

    let npsResponsesIter = npsResponses.values();
    let filteredIter = npsResponsesIter.filter(func(response) { response.contractId == contractId });
    filteredIter.toArray();
  };

  public query ({ caller }) func getNpsResponsesExist(orgId : OrgId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can query NPS existence");
    };
    verifyOrgAccess(caller, orgId);

    let npsResponsesIter = npsResponses.values();
    let filteredIter = npsResponsesIter.filter(func(response) { response.orgId == orgId });
    switch (filteredIter.next()) {
      case (null) { false };
      case (_) { true };
    };
  };

  public shared ({ caller }) func generateReport(report : Report) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate reports");
    };
    verifyDataEditAccess(caller, report.orgId);
    if (report.generatedBy != caller) {
      Runtime.trap("Unauthorized: Cannot generate report for another user");
    };
    reports.add(report.id, report);
  };

  public query ({ caller }) func getReport(id : Text) : async ?Report {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reports");
    };
    switch (reports.get(id)) {
      case null { null };
      case (?report) {
        verifyOrgAccess(caller, report.orgId);
        ?report;
      };
    };
  };

  public query ({ caller }) func listReports(orgId : OrgId) : async [Report] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list reports");
    };
    verifyOrgAccess(caller, orgId);
    let reportsIter = reports.values();
    let filteredIter = reportsIter.filter(func(report) { report.orgId == orgId });
    filteredIter.toArray();
  };

  public shared ({ caller }) func inviteTeamMember(invitation : TeamInvitation) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can invite team members");
    };
    verifyOrgManagementAccess(caller, invitation.orgId);
    if (invitation.invitedBy != caller) {
      Runtime.trap("Unauthorized: Cannot create invitation for another user");
    };
    teamInvitations.add(invitation.id, invitation);
  };

  public query ({ caller }) func listTeamInvitations(orgId : OrgId) : async [TeamInvitation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list team invitations");
    };
    verifyOrgAccess(caller, orgId);
    let invitationsIter = teamInvitations.values();
    let filteredIter = invitationsIter.filter(func(invitation) { invitation.orgId == orgId });
    filteredIter.toArray();
  };

  public shared ({ caller }) func addMemberToOrg(user : Principal, orgId : OrgId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add members to organizations");
    };
    verifyOrgManagementAccess(caller, orgId);

    let currentOrgs = switch (orgMemberships.get(user)) {
      case null { [] };
      case (?orgs) { orgs };
    };
    orgMemberships.add(user, currentOrgs.concat([orgId]));
  };

  public query ({ caller }) func listOrgMembers(orgId : OrgId) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list organization members");
    };
    verifyOrgAccess(caller, orgId);

    let members = Map.empty<Principal, Bool>();
    for ((user, orgs) in orgMemberships.entries()) {
      for (org in orgs.values()) {
        if (org == orgId) {
          members.add(user, true);
        };
      };
    };
    members.keys().toArray();
  };

  public query ({ caller }) func getChurnOverview(params : ChurnParams) : async ChurnOverview {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can query org churn");
    };
    verifyOrgAccess(caller, params.orgId);

    let contractsIter = contracts.values();
    let orgContractsIter = contractsIter.filter(func(c) { c.orgId == params.orgId });
    let orgContracts = orgContractsIter.toArray();

    let totalContracts = orgContracts.size();
    let totalCancelledContracts = orgContracts.filter(func(c) { c.isCancelled }).size();

    let periodContractsIter = orgContracts.values().filter(func(c) {
      c.startDate <= params.endTime and
      (switch (c.endDate) {
        case (?e) { e >= params.startTime };
        case (null) { true };
      });
    });
    let periodContracts = periodContractsIter.toArray();
    let periodCancelledContracts = periodContracts.filter(func(c) { c.isCancelled }).size();
    let periodCanceledContracts = periodCancelledContracts;
    let periodActiveContracts = periodContracts.filter(func(c) { not c.isCancelled }).size();

    let periodRetentionRate : Float = if (periodContracts.size() == 0) {
      1.0;
    } else {
      periodActiveContracts.toFloat() / periodContracts.size().toFloat();
    };

    let periodChurnRate : Float = if (periodContracts.size() == 0) {
      0.0;
    } else {
      periodCanceledContracts.toFloat() / periodContracts.size().toFloat();
    };

    let npsResponsesIter = npsResponses.values();
    let periodNpsResponsesIter = npsResponsesIter.filter(func(r) {
      r.orgId == params.orgId and r.submittedAt >= params.startTime and r.submittedAt <= params.endTime
    });
    let periodNpsResponses = periodNpsResponsesIter.toArray();
    let periodNetPromoterScore : Float = if (periodNpsResponses.size() == 0) {
      0.0;
    } else {
      let sum = periodNpsResponses.values().foldLeft(
        0,
        func(acc, response) { acc + response.score },
      );
      sum.toFloat() / periodNpsResponses.size().toFloat();
    };

    let orgCancellationsIter = orgContractsIter.filter(func(c) { c.isCancelled });
    let orgCancellations = orgCancellationsIter.toArray();
    let cancellationStats = Map.empty<Text, Nat>();
    for (c in orgCancellations.values()) {
      let count = switch (cancellationStats.get(c.cancellationReason)) {
        case (null) { 0 };
        case (?n) { n };
      };
      cancellationStats.add(c.cancellationReason, count + 1);
    };

    let cancellationReasons = switch (cancellationStats.size()) {
      case (0) { [] };
      case (_) {
        cancellationStats.entries().toArray();
      };
    };

    {
      orgId = params.orgId;
      totalContracts;
      totalCancelledContracts;
      cancellationReasons;
      periodCancelledContracts;
      periodCanceledContracts;
      periodActiveContracts;
      periodRetentionRate;
      periodChurnRate;
      periodNetPromoterScore;
    };
  };

  // Support messaging functions
  public shared ({ caller }) func sendSupportMessage(message : Text, orgId : OrgId, timestamp : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send support messages");
    };
    verifyOrgAccess(caller, orgId);

    let messageId = caller.toText() # "-" # Int.toText(timestamp);
    let supportMessage : SupportMessage = {
      id = messageId;
      orgId = orgId;
      message = message;
      sentBy = caller;
      sentAt = timestamp;
    };
    supportMessages.add(messageId, supportMessage);
  };

  public query ({ caller }) func getSupportMessages(orgId : OrgId) : async [SupportMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view support messages");
    };

    // Firsty staff can see all organizations' messages
    if (isFirstyStaff(caller)) {
      let messagesIter = supportMessages.values();
      let filteredIter = messagesIter.filter(func(msg) { msg.orgId == orgId });
      return filteredIter.toArray();
    };

    // Regular users can only see their own organization's messages
    verifyOrgAccess(caller, orgId);
    let messagesIter = supportMessages.values();
    let filteredIter = messagesIter.filter(func(msg) { msg.orgId == orgId });
    filteredIter.toArray();
  };

  public query ({ caller }) func getAllSupportMessages() : async [SupportMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view support messages");
    };

    // Only Firsty staff can see all support messages across all organizations
    if (not isFirstyStaff(caller)) {
      Runtime.trap("Unauthorized: Only Firsty staff can view all support messages");
    };

    supportMessages.values().toArray();
  };
};
