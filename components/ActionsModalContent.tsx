import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FileDocument } from "@/types/file";

const ImageThumbnail = ({ file }: { file: FileDocument }) => {
  const createdAt = file.$createdAt || (file._creationTime ? new Date(file._creationTime).toISOString() : new Date().toISOString());
  
  return (
    <div className="file-details-thumbnail">
      <Thumbnail 
        type={file.type} 
        extension={file.extension} 
        url={file.url}
        muxPlaybackId={file.muxPlaybackId}
        muxStatus={file.muxStatus}
        muxThumbnail={file.muxThumbnail}
      />
      <div className="flex flex-col">
        <p className="subtitle-2 mb-1">{file.name}</p>
        <FormattedDateTime 
          date={createdAt}
          className="caption" 
        />
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="file-details-label text-left">{label}</p>
    <p className="file-details-value text-left">{value}</p>
  </div>
);

export const FileDetails = ({ file }: { file: FileDocument }) => {
  const lastEdit = file.$updatedAt || (file._creationTime ? new Date(file._creationTime).toISOString() : new Date().toISOString());
  
  return (
    <>
      <ImageThumbnail file={file} />
      <div className="space-y-4 px-2 pt-2">
        <DetailRow label="Format:" value={file.extension} />
        <DetailRow label="Size:" value={convertFileSize(file.size)} />
        <DetailRow label="Owner:" value={file.owner?.fullName || 'You'} />
        <DetailRow 
          label="Last edit:" 
          value={formatDateTime(lastEdit)} 
        />
      </div>
    </>
  );
};

interface Props {
  file: FileDocument;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
}

export const ShareInput = ({ file, onInputChange, onRemove }: Props) => {
  const users = file.users || [];
  
  return (
    <>
      <ImageThumbnail file={file} />

      <div className="share-wrapper">
        <p className="subtitle-2 pl-1 text-light-100">
          Share file with other users
        </p>
        <Input
          type="email"
          placeholder="Enter email address"
          onChange={(e) => onInputChange(e.target.value.trim().split(","))}
          className="share-input-field"
        />
        <div className="pt-4">
          <div className="flex justify-between">
            <p className="subtitle-2 text-light-100">Shared with</p>
            <p className="subtitle-2 text-light-200">
              {users.length} users
            </p>
          </div>

          <ul className="pt-2">
            {users.map((email: string) => (
              <li
                key={email}
                className="flex items-center justify-between gap-2"
              >
                <p className="subtitle-2">{email}</p>
                <Button
                  onClick={() => onRemove(email)}
                  className="share-remove-user"
                >
                  <Image
                    src="/assets/icons/remove.svg"
                    alt="Remove"
                    width={24}
                    height={24}
                    className="remove-icon"
                  />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
