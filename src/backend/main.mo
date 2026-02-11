import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  type OrgId = Text;
  type BoardId = Text;

  type ProjectPhase = {
    #planning;
    #inProgress;
    #completed;
  };

  type DealStatus = {
    #active;
    #won;
    #lost;
  };

  type ActivityStatus = {
    #open;
    #completed;
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
    status : DealStatus;
    startDate : Int;
    createdBy : Principal;
    orgId : OrgId;
  };

  public type Activity = {
    id : Text;
    name : Text;
    dueDate : ?Int;
    status : ActivityStatus;
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

  public type PipelineColumn = {
    id : Text;
    name : Text;
    position : Nat;
    orgId : OrgId;
    boardId : BoardId;
    createdBy : Principal;
    createdAt : Int;
  };

  public type ColumnUpdate = {
    id : Text;
    name : Text;
    newPosition : Nat;
    boardId : BoardId;
  };

  type CardId = Text;

  public type FieldType = {
    #text : Text;
    #number : Float;
    #date : Int;
    #singleSelect : Text;
    #multiSelect : [Text];
    #tags : [Text];
  };

  public type CustomFieldDefinition = {
    name : Text;
    fieldType : FieldType;
    options : [Text]; // for select/multi-select
  };

  public type CustomField = {
    name : Text;
    value : FieldType;
  };

  public type KanbanCard = {
    id : CardId;
    title : Text;
    description : Text;
    dueDate : ?Int;
    columnId : Text;
    orgId : OrgId;
    boardId : BoardId;
    createdBy : Principal;
    createdAt : Int;
    updatedAt : Int;
    customFields : [CustomField];
  };

  public type CardInput = {
    title : Text;
    description : Text;
    dueDate : ?Int;
    columnId : Text;
    orgId : OrgId;
    boardId : BoardId;
    customFields : [CustomField];
  };

  public type KanbanBoard = {
    id : BoardId;
    name : Text;
    orgId : OrgId;
    createdBy : Principal;
    createdAt : Int;
    customFieldDefinitions : [CustomFieldDefinition];
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

  let pipelineColumns = Map.empty<Text, PipelineColumn>();
  let kanbanCards = Map.empty<Text, KanbanCard>();
  let kanbanBoards = Map.empty<Text, KanbanBoard>();

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access organization data");
    };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage organizations");
    };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit data");
    };

    if (isFirstyStaff(caller)) {
      return;
    };

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

    if (caller != user and not isFirstyStaff(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let existingProfile = userProfiles.get(caller);
    switch (existingProfile) {
      case null {
        switch (profile.appRole) {
          case (#FIRSTY_ADMIN or #FIRSTY_CONSULTANT) {
            Runtime.trap("Unauthorized: Cannot assign Firsty staff roles to yourself");
          };
          case (_) {};
        };
      };
      case (?existing) {
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

    switch (profile.appRole) {
      case (#OWNER_ADMIN or #MEMBER) {
        switch (profile.currentOrgId) {
          case null {
            Runtime.trap("OWNER_ADMIN and MEMBER must belong to an organization");
          };
          case (?orgId) {
            if (not isMemberOfOrg(caller, orgId)) {
              Runtime.trap("Cannot set currentOrgId to an organization you are not a member of");
            };
          };
        };
      };
      case (#FIRSTY_ADMIN or #FIRSTY_CONSULTANT) {};
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createOrganization(name : Text, timestamp : Int) : async OrgId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create organizations");
    };
    let orgId = caller.toText() # "-" # timestamp.toText();
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

    if (isFirstyStaff(caller)) {
      return organizations.values().toArray();
    };

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

    organizations.remove(orgId);

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

  // Board management methods
  public shared ({ caller }) func createKanbanBoard(orgId : OrgId, name : Text) : async BoardId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create boards");
    };
    verifyDataEditAccess(caller, orgId);
    let boardId = orgId # "-" # name;
    let newBoard : KanbanBoard = {
      id = boardId;
      name;
      orgId;
      createdBy = caller;
      createdAt = Time.now();
      customFieldDefinitions = [];
    };
    kanbanBoards.add(boardId, newBoard);
    boardId;
  };

  public shared ({ caller }) func updateKanbanBoard(boardId : BoardId, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update boards");
    };
    let board = switch (kanbanBoards.get(boardId)) {
      case (null) { Runtime.trap("Board not found") };
      case (?b) { b };
    };
    verifyDataEditAccess(caller, board.orgId);
    let updatedBoard = {
      board with name;
    };
    kanbanBoards.add(boardId, updatedBoard);
  };

  public shared ({ caller }) func deleteKanbanBoard(boardId : BoardId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete boards");
    };
    let board = switch (kanbanBoards.get(boardId)) {
      case (null) { Runtime.trap("Board not found") };
      case (?b) { b };
    };
    verifyDataEditAccess(caller, board.orgId);
    kanbanBoards.remove(boardId);
  };

  public query ({ caller }) func getKanbanBoard(boardId : BoardId) : async KanbanBoard {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view boards");
    };
    switch (kanbanBoards.get(boardId)) {
      case (null) { Runtime.trap("Board not found") };
      case (?board) {
        verifyOrgAccess(caller, board.orgId);
        board;
      };
    };
  };

  public query ({ caller }) func listKanbanBoards(orgId : OrgId) : async [KanbanBoard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list boards");
    };
    verifyOrgAccess(caller, orgId);
    let boardsIter = kanbanBoards.values();
    let filteredIter = boardsIter.filter(func(board) { board.orgId == orgId });
    filteredIter.toArray();
  };

  // Board scoped column logic
  public query ({ caller }) func getPipelineColumns(orgId : OrgId, boardId : BoardId) : async [PipelineColumn] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view pipeline columns");
    };
    verifyOrgAccess(caller, orgId);
    let columnsIter = pipelineColumns.values();
    let filteredIter = columnsIter.filter(func(column) {
      column.orgId == orgId and column.boardId == boardId
    });
    filteredIter.toArray();
  };

  public query ({ caller }) func getPipelineColumn(columnId : Text, boardId : BoardId) : async ?PipelineColumn {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view pipeline columns");
    };
    let column = pipelineColumns.get(columnId);
    switch (column) {
      case (null) { return null };
      case (?col) {
        verifyOrgAccess(caller, col.orgId);
        if (col.boardId != boardId) {
          Runtime.trap("Column does not exist for this board");
        };
      };
    };
    column;
  };

  public shared ({ caller }) func createPipelineColumn(orgId : OrgId, boardId : BoardId, name : Text, position : Nat, timestamp : Int) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create pipeline columns");
    };
    verifyDataEditAccess(caller, orgId);
    let columnId = name # orgId # boardId # "-" # timestamp.toText();
    let column : PipelineColumn = {
      id = columnId;
      name = name;
      position = position;
      orgId = orgId;
      boardId = boardId;
      createdBy = caller;
      createdAt = timestamp;
    };
    pipelineColumns.add(columnId, column);
    columnId;
  };

  public shared ({ caller }) func updatePipelineColumn(columnId : Text, boardId : BoardId, newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update pipeline columns");
    };

    let column = switch (pipelineColumns.get(columnId)) {
      case (null) { Runtime.trap("Column not found") };
      case (?c) { c };
    };

    verifyDataEditAccess(caller, column.orgId);

    if (column.boardId != boardId) {
      Runtime.trap("Column does not exist for this board");
    };

    let updatedColumn = {
      column with
      name = newName;
    };
    pipelineColumns.add(columnId, updatedColumn);
  };

  public shared ({ caller }) func deletePipelineColumn(columnId : Text, boardId : BoardId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete pipeline columns");
    };

    let column = switch (pipelineColumns.get(columnId)) {
      case (null) { Runtime.trap("Column not found") };
      case (?c) { c };
    };

    verifyDataEditAccess(caller, column.orgId);

    if (column.boardId != boardId) {
      Runtime.trap("Column does not exist for this board");
    };

    pipelineColumns.remove(columnId);
  };

  public shared ({ caller }) func reorderPipelineColumns(orgId : OrgId, boardId : BoardId, updates : [ColumnUpdate]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reorder pipeline columns");
    };
    verifyDataEditAccess(caller, orgId);

    let idMap = Map.empty<Text, Nat>();
    let positionMap = Map.empty<Nat, Text>();
    for (u in updates.values()) {
      if (idMap.containsKey(u.id)) {
        Runtime.trap("Duplicate column id in request: " # u.id);
      };
      idMap.add(u.id, u.newPosition);

      if (positionMap.containsKey(u.newPosition)) {
        Runtime.trap("Duplicate column position in request: " # u.newPosition.toText());
      };
      positionMap.add(u.newPosition, u.id);
    };

    for (u in updates.values()) {
      let column = switch (pipelineColumns.get(u.id)) {
        case (null) { Runtime.trap("Column not found: " # u.id) };
        case (?c) { c };
      };

      if (column.orgId != orgId) {
        Runtime.trap("Column does not belong to specified org: " # u.id);
      };

      if (column.boardId != boardId) {
        Runtime.trap("Column does not exist for this board");
      };

      let updatedColumn = {
        column with
        name = u.name;
        position = u.newPosition;
      };
      pipelineColumns.add(u.id, updatedColumn);
    };
  };

  public shared ({ caller }) func renamePipelineColumn(columnId : Text, boardId : BoardId, newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rename pipeline columns");
    };

    let column = switch (pipelineColumns.get(columnId)) {
      case (null) { Runtime.trap("Column not found") };
      case (?c) { c };
    };

    verifyDataEditAccess(caller, column.orgId);

    if (column.boardId != boardId) {
      Runtime.trap("Column does not exist for this board");
    };

    let updatedColumn = {
      column with name = newName;
    };
    pipelineColumns.add(columnId, updatedColumn);
  };

  // Custom field definition management
  public shared ({ caller }) func addOrUpdateCustomFieldDefinition(orgId : OrgId, boardId : BoardId, definition : CustomFieldDefinition) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage custom field definitions");
    };
    verifyDataEditAccess(caller, orgId);
    let board = switch (kanbanBoards.get(boardId)) {
      case (null) { Runtime.trap("Board not found") };
      case (?b) { b };
    };
    if (board.orgId != orgId) {
      Runtime.trap("Board does not belong to specified org");
    };

    let existingDefs = board.customFieldDefinitions.filter(func(def) { def.name != definition.name });
    let updatedDefs = existingDefs.concat([definition]);
    let updatedBoard = {
      board with
      customFieldDefinitions = updatedDefs;
    };
    kanbanBoards.add(boardId, updatedBoard);
  };

  // Kanban Card Functions (now board scoped)

  public shared ({ caller }) func createCard(input : CardInput) : async CardId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create cards");
    };
    verifyDataEditAccess(caller, input.orgId);
    _validateColumn(input.columnId, input.orgId, input.boardId);

    let card : KanbanCard = {
      id = input.title # input.orgId # Time.now().toText();
      title = input.title;
      description = input.description;
      dueDate = input.dueDate;
      columnId = input.columnId;
      orgId = input.orgId;
      boardId = input.boardId;
      createdBy = caller;
      createdAt = Time.now();
      updatedAt = Time.now();
      customFields = input.customFields;
    };

    kanbanCards.add(card.id, card);
    card.id;
  };

  public shared ({ caller }) func updateCard(cardId : CardId, input : CardInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cards");
    };
    let card = _getCardOrTrap(cardId);
    verifyDataEditAccess(caller, card.orgId);

    _validateColumn(input.columnId, card.orgId, card.boardId);

    if (card.boardId != input.boardId) {
      Runtime.trap("Cannot move existing card to a different board");
    };

    let updatedCard = {
      card with
      title = input.title;
      description = input.description;
      dueDate = input.dueDate;
      columnId = input.columnId;
      updatedAt = Time.now();
      customFields = input.customFields;
    };
    kanbanCards.add(cardId, updatedCard);
  };

  public shared ({ caller }) func moveCard(cardId : CardId, destinationColumnId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can move cards");
    };
    let card = _getCardOrTrap(cardId);
    verifyDataEditAccess(caller, card.orgId);
    _validateColumn(destinationColumnId, card.orgId, card.boardId);

    let updatedCard = {
      card with
      columnId = destinationColumnId;
      updatedAt = Time.now();
    };
    kanbanCards.add(cardId, updatedCard);
  };

  public shared ({ caller }) func deleteCard(cardId : CardId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete cards");
    };
    let card = _getCardOrTrap(cardId);
    verifyDataEditAccess(caller, card.orgId);
    kanbanCards.remove(cardId);
  };

  public query ({ caller }) func getCard(cardId : CardId) : async KanbanCard {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cards");
    };
    let card = _getCardOrTrap(cardId);
    verifyOrgAccess(caller, card.orgId);
    card;
  };

  public query ({ caller }) func getCardsByColumn(columnId : Text, boardId : BoardId) : async [KanbanCard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cards");
    };

    let column = switch (pipelineColumns.get(columnId)) {
      case (null) { Runtime.trap("Column not found") };
      case (?c) { c };
    };

    verifyOrgAccess(caller, column.orgId);

    if (column.boardId != boardId) {
      Runtime.trap("Column does not exist for this board");
    };

    let cardsIter = kanbanCards.values();
    let filteredIter = cardsIter.filter(func(card) {
      card.columnId == columnId and card.boardId == boardId
    });
    filteredIter.toArray();
  };

  public query ({ caller }) func getCardsByBoard(orgId : OrgId, boardId : BoardId) : async [KanbanCard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cards");
    };
    verifyOrgAccess(caller, orgId);

    let cardsIter = kanbanCards.values();
    let filteredIter = cardsIter.filter(func(card) {
      card.orgId == orgId and card.boardId == boardId
    });
    filteredIter.toArray();
  };

  func _validateColumn(columnId : Text, orgId : OrgId, boardId : BoardId) {
    switch (pipelineColumns.get(columnId)) {
      case (null) {
        Runtime.trap("Column not found (" # columnId # "); Use [component \"KANBAN_COLUMNS\"] to create columns first.");
      };
      case (?col) {
        if (col.orgId != orgId) {
          Runtime.trap("Column does not belong to specified org");
        };
        if (col.boardId != boardId) {
          Runtime.trap("Column does not exist for this board");
        };
      };
    };
  };

  func _getCardOrTrap(cardId : CardId) : KanbanCard {
    switch (kanbanCards.get(cardId)) {
      case (null) { Runtime.trap("Card not found") };
      case (?card) { card };
    };
  };

  // Dashboard API
  public query ({ caller }) func getOrgDeals(orgId : OrgId) : async [Deal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view deals");
    };
    verifyOrgAccess(caller, orgId);

    let dealsIter = deals.values();
    let filteredIter = dealsIter.filter(func(deal) { deal.orgId == orgId });
    filteredIter.toArray();
  };

  public query ({ caller }) func getOrgActivities(orgId : OrgId) : async [Activity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view activities");
    };
    verifyOrgAccess(caller, orgId);

    let activitiesIter = activities.values();
    let filteredIter = activitiesIter.filter(func(activity) { activity.orgId == orgId });
    filteredIter.toArray();
  };

  public query ({ caller }) func getOrgContracts(orgId : OrgId) : async [Contract] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view contracts");
    };
    verifyOrgAccess(caller, orgId);

    let contractsIter = contracts.values();
    let filteredIter = contractsIter.filter(func(contract) { contract.orgId == orgId });
    filteredIter.toArray();
  };
};
