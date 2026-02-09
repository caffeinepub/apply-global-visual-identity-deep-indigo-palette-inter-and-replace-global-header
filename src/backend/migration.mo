import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
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

  type AppUserRole = {
    #FIRSTY_ADMIN;
    #FIRSTY_CONSULTANT;
    #OWNER_ADMIN;
    #MEMBER;
  };

  type OldUserProfile = {
    firstName : Text;
    lastName : Text;
    email : Text;
    currentOrgId : ?OrgId;
  };

  type NewUserProfile = {
    firstName : Text;
    lastName : Text;
    email : Text;
    currentOrgId : ?OrgId;
    appRole : AppUserRole;
  };

  type Organization = {
    id : OrgId;
    name : Text;
    createdBy : Principal;
    createdAt : Int;
  };

  type OrgMembership = {
    userId : Principal;
    orgId : OrgId;
    joinedAt : Int;
  };

  type DocumentCategory = {
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

  type Document = {
    id : Text;
    file : Blob;
    name : Text;
    uploadedBy : Principal;
    orgId : OrgId;
    uploadedAt : Int;
    category : DocumentCategory;
  };

  type DocumentUploadInput = {
    name : Text;
    orgId : OrgId;
    file : Blob;
    category : DocumentCategory;
  };

  type Contact = {
    id : Text;
    name : Text;
    email : Text;
    phone : Text;
    createdBy : Principal;
    orgId : OrgId;
  };

  type Project = {
    id : Text;
    name : Text;
    description : Text;
    phase : ProjectPhase;
    createdBy : Principal;
    orgId : OrgId;
  };

  type Deal = {
    id : Text;
    name : Text;
    value : Nat;
    stage : DealStage;
    createdBy : Principal;
    orgId : OrgId;
  };

  type Activity = {
    id : Text;
    name : Text;
    dueDate : ?Int;
    completed : Bool;
    relatedProject : ?Text;
    orgId : OrgId;
    createdBy : Principal;
  };

  type Contract = {
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

  type NpsCampaign = {
    id : Text;
    name : Text;
    orgId : OrgId;
    createdBy : Principal;
    createdAt : Int;
    status : Text;
  };

  type NpsResponse = {
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

  type Report = {
    id : Text;
    reportType : Text;
    period : Text;
    format : Text;
    generatedAt : Int;
    generatedBy : Principal;
    orgId : OrgId;
  };

  type FinanceTransaction = {
    id : Text;
    description : Text;
    amount : Nat;
    createdBy : Principal;
    orgId : OrgId;
    createdAt : Int;
  };

  type TeamInvitation = {
    id : Text;
    inviteeIdentifier : Text;
    orgId : OrgId;
    invitedBy : Principal;
    invitedAt : Int;
    status : Text;
  };

  type SupportMessage = {
    id : Text;
    orgId : OrgId;
    message : Text;
    sentBy : Principal;
    sentAt : Int;
  };

  type ChurnParams = {
    orgId : OrgId;
    startTime : Int;
    endTime : Int;
  };

  type CancellationStats = {
    reason : Text;
    count : Nat;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    contacts : Map.Map<Text, Contact>;
    projects : Map.Map<Text, Project>;
    deals : Map.Map<Text, Deal>;
    documents : Map.Map<Text, Document>;
    activities : Map.Map<Text, Activity>;
    contracts : Map.Map<Text, Contract>;
    npsCampaigns : Map.Map<Text, NpsCampaign>;
    npsResponses : Map.Map<Text, NpsResponse>;
    reports : Map.Map<Text, Report>;
    financeTransactions : Map.Map<Text, FinanceTransaction>;
    teamInvitations : Map.Map<Text, TeamInvitation>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    contacts : Map.Map<Text, Contact>;
    projects : Map.Map<Text, Project>;
    deals : Map.Map<Text, Deal>;
    documents : Map.Map<Text, Document>;
    activities : Map.Map<Text, Activity>;
    contracts : Map.Map<Text, Contract>;
    npsCampaigns : Map.Map<Text, NpsCampaign>;
    npsResponses : Map.Map<Text, NpsResponse>;
    reports : Map.Map<Text, Report>;
    financeTransactions : Map.Map<Text, FinanceTransaction>;
    teamInvitations : Map.Map<Text, TeamInvitation>;
    supportMessages : Map.Map<Text, SupportMessage>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        // Default all legacy data to #MEMBER (lowest privilege role).
        // Users who want to become admins can request it via the support chat.
        {
          oldProfile with
          appRole = #MEMBER;
        };
      }
    );

    {
      old with
      userProfiles = newUserProfiles;
      supportMessages = Map.empty<Text, SupportMessage>();
    };
  };
};
