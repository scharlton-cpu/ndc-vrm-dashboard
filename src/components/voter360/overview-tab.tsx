import { DataField } from "@/components/shared/data-quality-badge";

type Voter = {
  addressLine: string | null;
  parish: string | null;
  sex: string | null;
  sexSource: "KNOWN" | "ESTIMATED" | "UNKNOWN";
  ageBand: string | null;
  ageBandSource: "KNOWN" | "ESTIMATED" | "UNKNOWN";
  dateOfBirth: Date | null;
  occupation: string | null;
  occupationSource: "KNOWN" | "ESTIMATED" | "UNKNOWN";
  phone: string | null;
  phoneSource: "KNOWN" | "ESTIMATED" | "UNKNOWN";
  email: string | null;
  emailSource: "KNOWN" | "ESTIMATED" | "UNKNOWN";
  recordSource: string;
  voterNumber: string;
  constituency: { name: string };
  pollingDivision: { name: string };
};

export function OverviewTab({ voter }: { voter: Voter }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <DataField label="Voter ID" value={<span className="font-mono">{voter.voterNumber}</span>} source="KNOWN" />
      <DataField label="Constituency" value={voter.constituency.name} source="KNOWN" />
      <DataField label="Polling Division" value={voter.pollingDivision.name} source="KNOWN" />
      <DataField label="Sex" value={voter.sex ? (voter.sex === "MALE" ? "Male" : "Female") : null} source={voter.sexSource} />
      <DataField
        label="Age Band"
        value={voter.ageBand}
        source={voter.ageBandSource}
      />
      <DataField label="Occupation" value={voter.occupation} source={voter.occupationSource} />
      <DataField label="Phone" value={voter.phone} source={voter.phoneSource} />
      <DataField label="Email" value={voter.email} source={voter.emailSource} />
      <DataField label="Address" value={voter.addressLine} source="KNOWN" />
      <DataField label="Parish" value={voter.parish} source="KNOWN" />
      <DataField label="Record Source" value={voter.recordSource} source="KNOWN" />
    </div>
  );
}
