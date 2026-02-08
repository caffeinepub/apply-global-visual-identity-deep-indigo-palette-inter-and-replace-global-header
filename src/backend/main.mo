import Map "mo:core/Map";
import Text "mo:core/Text";
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

  public type UserProfile = {
    firstName : Text;
    lastName : Text;
    email : Text;
    currentOrgId : ?OrgId;
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
  };

  public type NpsCampaign = {
    id : Text;
    name : Text;
    orgId : OrgId;
    createdBy : Principal;
    createdAt : Int;
    status : Text;
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
  let reports = Map.empty<Text, Report>();
  let financeTransactions = Map.empty<Text, FinanceTransaction>();
  let teamInvitations = Map.empty<Text, TeamInvitation>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

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
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isCreator = isOrgCreator(caller, orgId);
    if (not (isAdmin or isCreator)) {
      Runtime.trap("Unauthorized: Only organization creators or admins can manage this organization");
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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
    verifyOrgAccess(caller, contact.orgId);
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
    verifyOrgAccess(caller, project.orgId);
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
    verifyOrgAccess(caller, deal.orgId);
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
    verifyOrgAccess(caller, activity.orgId);
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
    verifyOrgAccess(caller, contract.orgId);
    if (contract.createdBy != caller) {
      Runtime.trap("Unauthorized: Cannot create contract for another user");
    };
    contracts.add(contract.id, contract);
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

  public shared ({ caller }) func createFinanceTransaction(transaction : FinanceTransaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create finance transactions");
    };
    verifyOrgAccess(caller, transaction.orgId);
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
    verifyOrgAccess(caller, input.orgId);

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
    verifyOrgAccess(caller, campaign.orgId);
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

  public shared ({ caller }) func generateReport(report : Report) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate reports");
    };
    verifyOrgAccess(caller, report.orgId);
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
};
